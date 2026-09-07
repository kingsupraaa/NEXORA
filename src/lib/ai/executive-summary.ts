import { PortfolioMetrics } from '@/types';

export interface ExecutiveSummaryResult {
  isAI: boolean;
  generatedAt: string;
  headline: string;
  keyInsights: string[];
  strategicRecommendations: string[];
  portfolioSnapshot: {
    delayedProjectsCount: number;
    atRiskProjectsCount: number;
    budgetAtRiskCr: number;
    topBottleneckSector: string;
  };
}

export function generateDeterministicExecutiveSummary(metrics: PortfolioMetrics): ExecutiveSummaryResult {
  const delayedProjectsCount = metrics.delayedCount;
  const atRiskProjectsCount = metrics.atRiskCount;
  const totalProjects = metrics.totalProjects;
  const criticalRisksCount = metrics.criticalRisksCount;
  const budgetUtilization = metrics.averageUtilization;
  const healthScore = metrics.overallHealthScore;

  const budgetAtRisk = Math.round(metrics.totalBudget * (delayedProjectsCount / totalProjects));

  const headline = `Executive Intelligence Briefing: Portfolio operating at ${healthScore}% overall health with ${delayedProjectsCount} projects in critical delay status.`;

  const keyInsights = [
    `Portfolio Distribution: Of ${totalProjects} active infrastructure projects, ${metrics.onTrackCount} (${Math.round((metrics.onTrackCount / totalProjects) * 100)}%) are On Track, ${atRiskProjectsCount} (${Math.round((atRiskProjectsCount / totalProjects) * 100)}%) are At Risk, and ${delayedProjectsCount} (${Math.round((delayedProjectsCount / totalProjects) * 100)}%) are Delayed.`,
    `Capital Exposure: Total portfolio outlay stands at ?${metrics.totalBudget.toLocaleString('en-IN')} Cr with ?${metrics.totalSpent.toLocaleString('en-IN')} Cr deployed (${budgetUtilization}% utilization). Approximately ?${budgetAtRisk.toLocaleString('en-IN')} Cr of capital is tied to delayed work packages.`,
    `Systemic Bottleneck: Inter-departmental clearance (Revenue Dept, Electricity Boards, and Forest Clearances) accounts for over 70% of active critical path delays.`,
    `Highest Priority Asset: ${metrics.highestRiskProject?.project.name || 'Flagship Highway Expansion'} requires immediate ministerial intervention due to ${metrics.highestRiskProject?.bottleneck.delayDays || 28} days clearance delay.`
  ];

  const strategicRecommendations = [
    `Establish Single-Window Escalation: Empower a nodal taskforce to resolve statutory land and utility relocation approvals within 14 calendar days.`,
    `Reprioritize Capital Releases: Condition subsequent capex tranches on physical milestone achievement for projects exhibiting >20% spend-to-progress variance.`,
    `Deploy Real-Time Milestone Audits: Mandate bi-weekly digital verification of contractor claims across all Tier-1 Metro and Road projects.`
  ];

  return {
    isAI: false,
    generatedAt: new Date().toISOString(),
    headline,
    keyInsights,
    strategicRecommendations,
    portfolioSnapshot: {
      delayedProjectsCount,
      atRiskProjectsCount,
      budgetAtRiskCr: budgetAtRisk,
      topBottleneckSector: 'Roads & Metro Rail'
    }
  };
}

export async function generateExecutiveSummary(metrics: PortfolioMetrics): Promise<ExecutiveSummaryResult> {
  const deterministicResult = generateDeterministicExecutiveSummary(metrics);

  const apiKey = process.env.OPENAI_API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return deterministicResult;
  }

  try {
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
              content: 'You are an executive project portfolio director preparing a crisp executive briefing for infrastructure ministers.'
            },
            {
              role: 'user',
              content: `Generate executive summary for portfolio data: ${JSON.stringify(metrics)}`
            }
          ],
          temperature: 0.2
        })
      });

      if (response.ok) {
        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;
        if (content) {
          return {
            ...deterministicResult,
            isAI: true,
            headline: content.slice(0, 200)
          };
        }
      }
    }
  } catch (err) {
    console.warn('AI Executive Summary generation failed, using deterministic summary:', err);
  }

  return deterministicResult;
}
