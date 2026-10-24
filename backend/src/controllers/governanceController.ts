import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import {
  generateSyntheticBenchmark,
  applyKAggregation,
  runOptOutAndPrivacyStressTest,
  runFairnessAndVulnerabilityAudit,
  executeRetentionScheduleRun,
} from '../services/governanceService.js';

export async function getGovernanceFramework(_req: AuthRequest, res: Response): Promise<void> {
  res.json({
    success: true,
    framework: {
      title: 'TRACK-2-03 Challenge 2: Data Governance Framework',
      scope: 'DPDP Act 2023 (India), GDPR (EU), CCPA/CPRA (California)',
      datasetDesign: {
        seed: 42,
        benchmarkSize: 10000,
        zones: {
          piiZone: 'Direct identifiers (name, email, phone) - strictly restricted',
          featureZone: 'Pseudonymous behavioural and demographic features - modelling zone',
          consentEvents: 'Append-only consent event ledger (grant, withdraw, version, channel)',
        },
        deliberateChallenges: [
          { challenge: 'Class imbalance', design: 'churned minority (~6%), high_value (~8%)' },
          { challenge: 'MCAR', design: '~3% of tenure_months and acquisition_channel missing completely at random' },
          { challenge: 'MAR', design: 'income_band missing more often for younger and mobile channel customers' },
          { challenge: 'MNAR', design: 'income_band more likely missing when true income is high; gender declined in some regions' },
          { challenge: 'Consent heterogeneity', design: '4 purposes with different grant rates, region effects, default deny on unknown' },
          { challenge: 'Group imbalance', design: 'Region mix: 55% IN, 30% EU, 15% US-CA' },
        ],
      },
      aggregationRules: {
        minimumCellSize: 'k >= 10 customers. Smaller cells suppressed',
        dominanceAndComplementarySuppression: 'Active',
        quasiIdentifierBanding: 'Age in 5-year bands, income in bands, tenure in 6-month bands',
        differentialPrivacy: 'Laplace epsilon = 1.0 per report',
      },
      accessControlMatrix: [
        { role: 'Data steward', piiZone: 'Read, join', featureZone: 'Read, write', consentLog: 'Read', aggregates: 'Yes' },
        { role: 'ML engineer', piiZone: 'No', featureZone: 'Read (consent-filtered)', consentLog: 'No', aggregates: 'Yes' },
        { role: 'Analyst', piiZone: 'No', featureZone: 'No (aggregates only)', consentLog: 'No', aggregates: 'Yes (k >= 10)' },
        { role: 'Support agent', piiZone: 'Read (ticket required)', featureZone: 'No', consentLog: 'Read own', aggregates: 'No' },
        { role: 'Privacy officer', piiZone: 'Read for requests', featureZone: 'Read', consentLog: 'Read, write', aggregates: 'Yes' },
        { role: 'Auditor', piiZone: 'No', featureZone: 'Metadata only', consentLog: 'Read', aggregates: 'Yes' },
      ],
      retentionSchedule: [
        { data: 'Direct identifiers (PII)', retention: 'Active account + 24 months', action: 'Delete' },
        { data: 'Transaction records', retention: 'Statutory accounting (up to 7 years)', action: 'Anonymise' },
        { data: 'Modelling features', retention: 'Rolling 36 months', action: 'Delete older partitions' },
        { data: 'Consent events', retention: 'Relationship + 3 years', action: 'Delete' },
        { data: 'Access and audit logs', retention: '12 months', action: 'Delete' },
        { data: 'Backups', retention: '35-day rolling cycle', action: 'Overwrite' },
      ],
    },
  });
}

export async function getSyntheticBenchmark(_req: AuthRequest, res: Response): Promise<void> {
  const benchmark = generateSyntheticBenchmark(100);
  const kAggregated = applyKAggregation(benchmark, 'ageBand', 10);
  res.json({
    success: true,
    totalBenchmarkSize: 10000,
    governanceMetadata: {
      seed: 42,
      benchmarkSize: 10000,
      missingnessPatterns: {
        MCAR: '~3% of tenure_months and acquisition_channel missing completely at random',
        MAR: 'income_band missing more often for younger and mobile channel customers',
        MNAR: 'income_band more likely missing when true income is high; gender declined in some regions',
      },
      classImbalance: {
        churnRiskPct: 6,
        highValuePct: 8,
      },
      regionMix: { IN: '55%', EU: '30%', US_CA: '15%' },
    },
    sampleCount: benchmark.length,
    sampleRecords: benchmark.slice(0, 5),
    kAnonymityDemo: kAggregated,
  });
}

export async function handleOptOutStressTest(_req: AuthRequest, res: Response): Promise<void> {
  const results = runOptOutAndPrivacyStressTest();
  res.json({ success: true, data: results, ...results });
}

export async function handleFairnessAudit(_req: AuthRequest, res: Response): Promise<void> {
  const results = runFairnessAndVulnerabilityAudit();
  res.json({ success: true, data: results, ...results });
}

export async function handleRetentionJob(req: AuthRequest, res: Response): Promise<void> {
  const shopId = req.user?.shopId || 'chai-and-co';
  const report = executeRetentionScheduleRun(shopId);
  res.json({ success: true, data: report, report });
}
