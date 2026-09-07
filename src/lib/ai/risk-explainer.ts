import { Project, AIExplanationResult } from '@/types';
import { calculateHealthScore } from '@/lib/calculations/health-score';
import { detectBottleneck } from '@/lib/calculations/dependency-graph';

/**
 * Deterministic Rule-Based Fallback Generator for Risk Explanation
 */
export function generateDeterministicRiskExplanation(project: Project): AIExplanationResult {
  const health = calculateHealthScore(project);
  const bottleneck = detectBottleneck(project);
  
  const reasons: string[] = [];

  // 1. Schedule & Progress Reason
  if (health.scheduleVariancePercentage < -10) {
    reasons.push(
      `Schedule Slippage: Actual physical progress (${project.progress}%) is lagging behind planned target (${project.plannedProgress}%) by ${Math.abs(health.scheduleVariancePercentage)}%, resulting in an estimated ${health.scheduleVarianceDays} days timeline delay.`
    );
  } else if (health.scheduleVariancePercentage < 0) {
    reasons.push(
      `Minor Schedule Lag: Physical completion is running ${Math.abs(health.scheduleVariancePercentage)}% below baseline schedule.`
    );
  }

  // 2. Bottleneck & Dependency Reason
  if (bottleneck.bottleneckActivity && bottleneck.delayDays > 0) {
    reasons.push(
      `Critical Path Blockage: "${bottleneck.bottleneckActivity.name}" owned by ${bottleneck.department} is delayed by ${bottleneck.delayDays} days, directly blocking ${bottleneck.blockedActivityCount} downstream activities (${bottleneck.blockedActivities.map(a => a.name).slice(0, 2).join(', ')}${bottleneck.blockedActivities.length > 2 ? ' and others' : ''}).`
    );
  }

  // 3. Milestone Delays
  const delayedMilestones = project.milestones.filter(m => m.status === 'Delayed' || m.delayDays > 0);
  if (delayedMilestones.length > 0) {
    const topMilestone = delayedMilestones.sort((a, b) => b.delayDays - a.delayDays)[0];
    reasons.push(
      `Milestone Overdue: Critical milestone "${topMilestone.name}" is overdue by ${topMilestone.delayDays} days (Assigned: ${topMilestone.owner}).`
    );
  }

  // 4. Budget & Spend Variance
  if (health.budgetOverrunFlag === 'Critical Overrun') {
    reasons.push(
      `Budget Depletion: Capital expenditure has reached ?${project.spent} Cr (${health.budgetUtilizationPercentage}% of ?${project.budget} Cr allocation) while physical progress is only ${project.progress}%, creating significant financial overrun risk.`
    );
  } else if (health.budgetOverrunFlag === 'High') {
    reasons.push(
      `High Budget Burn: Expenditure rate (${health.budgetUtilizationPercentage}%) exceeds physical progress (${project.progress}%).`
    );
  }

  // 5. Open Risks
  const openCritical = project.risks.filter(r => r.severity === 'Critical' && r.status !== 'Resolved');
  if (openCritical.length > 0) {
    reasons.push(
      `Unmitigated Critical Risk: "${openCritical[0].title}" requires immediate statutory and administrative clearance.`
    );
  }

  if (reasons.length === 0) {
    reasons.push('The project is executing normally within baseline budget and schedule tolerances.');
  }

  // Determine priority
  let priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' = 'LOW';
  if (health.overallHealth < 60 || bottleneck.priority === 'CRITICAL' || openCritical.length > 0) {
    priority = 'CRITICAL';
  } else if (health.overallHealth < 80 || bottleneck.priority === 'HIGH') {
    priority = 'HIGH';
  } else {
    priority = 'MEDIUM';
  }

  // Recommended Action
  let action = '';
  if (bottleneck.bottleneckActivity) {
    action = `Convene an emergency coordination review with ${bottleneck.department} to expedite "${bottleneck.bottleneckActivity.name}" within 7 working days to unblock ${bottleneck.blockedActivityCount} dependent work packages.`;
  } else if (openCritical.length > 0) {
    action = openCritical[0].recommendedAction;
  } else {
    action = 'Continue weekly milestone reviews and maintain active vendor monitoring.';
  }

  const summary = `${project.name} is currently flagged as ${health.status} with an overall health score of ${health.overallHealth}/100. Primary distress stems from ${bottleneck.department} dependencies and milestone slippage.`;

  return {
    isAI: false,
    projectSummary: summary,
    reasons,
    recommendedPriority: priority,
    recommendedAction: action,
    timestamp: new Date().toISOString()
  };
}

/**
 * AI-Powered Risk Explainer with Automatic Fallback
 */
export async function generateRiskExplanation(project: Project): Promise<AIExplanationResult> {
  const deterministicResult = generateDeterministicRiskExplanation(project);
  
  const apiKey = process.env.OPENAI_API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return deterministicResult;
  }

  try {
    // If OpenAI or Gemini key is provided, we can call it with deterministic structured signals as ground truth
    if (process.env.OPENAI_API_KEY) {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'You are an expert infrastructure project risk analyst for NEXORA. Provide concise, numbered risk breakdown and recommended actions based strictly on supplied project data.'
            },
            {
              role: 'user',
              content: `Analyze this project:\n${JSON.stringify({
                name: project.name,
                sector: project.sector,
                location: project.location,
                progress: project.progress,
                plannedProgress: project.plannedProgress,
                budget: project.budget,
                spent: project.spent,
                deterministicReasons: deterministicResult.reasons,
                recommendedAction: deterministicResult.recommendedAction
              })}`
            }
          ],
          temperature: 0.2
        })
      });

      if (response.ok) {
        const data = await response.json();
        const aiText = data.choices?.[0]?.message?.content;
        if (aiText) {
          return {
            ...deterministicResult,
            isAI: true,
            projectSummary: aiText.slice(0, 300)
          };
        }
      }
    }
  } catch (err) {
    console.warn('AI API call failed, safely falling back to deterministic explanation:', err);
  }

  return deterministicResult;
}
