import type {
  AutomationRule,
  AutomationRuleDraft,
  AutomationWorkspace,
  TaskSet,
  TaskSetDraft,
  TaskTemplate,
  TaskTemplateDraft,
} from '../../features/automations/models/automation';

export interface AutomationOperations {
  loadAutomationWorkspace(query: string): Promise<AutomationWorkspace>;
  saveAutomationTemplate(
    id: string | null,
    version: number | null,
    draft: TaskTemplateDraft,
  ): Promise<TaskTemplate>;
  deleteAutomationTemplate(id: string, version: number): Promise<void>;
  saveAutomationSet(
    id: string | null,
    version: number | null,
    draft: TaskSetDraft,
  ): Promise<TaskSet>;
  deleteAutomationSet(id: string, version: number): Promise<void>;
  saveAutomationRule(
    id: string | null,
    version: number | null,
    draft: AutomationRuleDraft,
  ): Promise<AutomationRule>;
  deleteAutomationRule(id: string, version: number): Promise<void>;
  retryAutomationRun(id: string): Promise<void>;
}
