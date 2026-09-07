import { ActivityDependency, BottleneckAnalysis, Project } from '@/types';

/**
 * Dependency Graph DAG Engine
 * 
 * Traverses activity dependencies to find downstream impact of delayed tasks.
 * Identifies the primary bottleneck as the delayed node blocking the largest number
 * of downstream uncompleted activities.
 */

/**
 * Given a delayed activity ID, find all transitive downstream activities that depend on it
 * and are not yet completed.
 */
export function getDownstreamActivities(
  activityId: string,
  dependencies: ActivityDependency[]
): ActivityDependency[] {
  const activityMap = new Map<string, ActivityDependency>();
  dependencies.forEach(d => activityMap.set(d.id, d));

  const visited = new Set<string>();
  const downstream: ActivityDependency[] = [];

  function traverse(currentId: string) {
    // Find all activities that directly list currentId in their dependsOn
    for (const act of dependencies) {
      if (act.dependsOn.includes(currentId) && !visited.has(act.id)) {
        visited.add(act.id);
        if (act.status !== 'Completed') {
          downstream.push(act);
        }
        traverse(act.id); // recurse downstream
      }
    }
  }

  traverse(activityId);
  return downstream;
}

/**
 * Computes bottleneck analysis across all activities in a project.
 * The bottleneck is the delayed activity causing the highest downstream blocked count.
 */
export function detectBottleneck(project: Project): BottleneckAnalysis {
  const dependencies = project.dependencies || [];
  const delayedNodes = dependencies.filter(d => d.status === 'Delayed' || d.delayDays > 0);

  if (delayedNodes.length === 0) {
    return {
      bottleneckActivity: null,
      delayDays: 0,
      blockedActivityCount: 0,
      blockedActivities: [],
      department: 'N/A',
      priority: 'LOW',
      impactStatement: 'No active activity bottlenecks detected. Project timeline is on track.',
      plainStatement: 'All scheduled predecessor tasks are operating within expected tolerances.'
    };
  }

  let topBottleneck: ActivityDependency | null = null;
  let maxBlockedActivities: ActivityDependency[] = [];
  let maxImpactScore = -1;

  for (const node of delayedNodes) {
    const downstream = getDownstreamActivities(node.id, dependencies);
    // Impact score considers both number of blocked nodes and node delay
    const impactScore = (downstream.length * 10) + node.delayDays;

    if (impactScore > maxImpactScore) {
      maxImpactScore = impactScore;
      topBottleneck = node;
      maxBlockedActivities = downstream;
    }
  }

  if (!topBottleneck) {
    topBottleneck = delayedNodes[0];
  }

  const blockedCount = maxBlockedActivities.length;
  const delay = topBottleneck.delayDays || 1;

  let priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' = 'LOW';
  if (blockedCount >= 3 || delay >= 20) {
    priority = 'CRITICAL';
  } else if (blockedCount >= 2 || delay >= 10) {
    priority = 'HIGH';
  } else if (blockedCount >= 1 || delay >= 5) {
    priority = 'MEDIUM';
  }

  const actName = topBottleneck.name;
  const owner = topBottleneck.owner || 'Project Operations';

  const plainStatement = blockedCount === 0
    ? `"${actName}" is delayed by ${delay} days with isolated impact.`
    : `This delay in "${actName}" is blocking ${blockedCount} downstream ${blockedCount === 1 ? 'activity' : 'activities'}.`;

  const impactStatement = blockedCount > 0
    ? `${owner} delay (${delay} days) blocks ${maxBlockedActivities.map(a => a.name).join(', ')}.`
    : `${owner} delay of ${delay} days under monitoring.`;

  return {
    bottleneckActivity: topBottleneck,
    delayDays: delay,
    blockedActivityCount: blockedCount,
    blockedActivities: maxBlockedActivities,
    department: owner,
    priority,
    impactStatement,
    plainStatement
  };
}

/**
 * Returns topological order or dependency chains for visualization
 */
export function getDependencyChains(dependencies: ActivityDependency[]): {
  roots: ActivityDependency[];
  inProgress: ActivityDependency[];
  blocked: ActivityDependency[];
} {
  const delayedMap = new Set(
    dependencies.filter(d => d.status === 'Delayed' || d.delayDays > 0).map(d => d.id)
  );

  const blockedIds = new Set<string>();
  delayedMap.forEach(dId => {
    getDownstreamActivities(dId, dependencies).forEach(act => blockedIds.add(act.id));
  });

  return {
    roots: dependencies.filter(d => d.dependsOn.length === 0),
    inProgress: dependencies.filter(d => d.status === 'In Progress' && !blockedIds.has(d.id)),
    blocked: dependencies.filter(d => blockedIds.has(d.id))
  };
}
