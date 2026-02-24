
import { Question, Objective, Failure, IRepository, KeyResult } from '../types';

const API_URL = 'https://qa-os-api.tiklt1.workers.dev/api/issues';

async function fetchAPI(method: string, data?: any): Promise<any> {
  const response = await fetch(API_URL, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: data ? JSON.stringify(data) : undefined,
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Request failed');
  }
  if (response.status === 204) return null;
  return response.json();
}

export const WorkersRepository: IRepository = {
  getQuestions: async (): Promise<Question[]> => {
    const items = await fetchAPI('GET');
    return items.filter((item: any) => item.type === 'QUESTION');
  },

  addQuestion: async (question: Question): Promise<Question> => {
    return fetchAPI('POST', question);
  },

  deleteQuestion: async (id: string): Promise<boolean> => {
    await fetchAPI('DELETE');
    return true;
  },

  getFailures: async (): Promise<Failure[]> => {
    const items = await fetchAPI('GET');
    return items.filter((item: any) => item.type === 'FAILURE');
  },

  addFailure: async (failure: Failure): Promise<Failure> => {
    return fetchAPI('POST', failure);
  },

  updateFailure: async (id: string, updates: Partial<Failure>): Promise<Failure | null> => {
    const item = { ...updates, id };
    return fetchAPI('PATCH', item);
  },

  findFailure: async (id: string): Promise<Failure | undefined> => {
    const items = await fetchAPI('GET');
    return items.find((item: any) => item.id === id && item.type === 'FAILURE');
  },

  getObjectives: async (): Promise<Objective[]> => {
    const items = await fetchAPI('GET');
    return items.filter((item: any) => item.type === 'OBJECTIVE');
  },

  addObjective: async (objective: Objective): Promise<Objective> => {
    return fetchAPI('POST', objective);
  },

  deleteObjective: async (id: string): Promise<boolean> => {
    await fetchAPI('DELETE');
    return true;
  },

  updateKeyResult: async (objectiveId: string, krId: string, status: KeyResult['status']): Promise<void> => {
    const objectives = await WorkersRepository.getObjectives();
    const objective = objectives.find(o => o.id === objectiveId);
    if (!objective) return;
    
    const updatedObjective = {
      ...objective,
      keyResults: objective.keyResults.map(kr => 
        kr.id === krId ? { ...kr, status, updatedAt: new Date().toISOString() } : kr
      ),
      updatedAt: new Date().toISOString()
    };
    
    await fetchAPI('PATCH', updatedObjective);
  }
};
