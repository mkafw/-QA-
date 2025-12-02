
import { useState, useEffect, useCallback } from 'react';
import { Question, Objective, Failure, IRepository } from '../types';
import { MemoryRepository } from '../repositories/MemoryRepository';
import { SupabaseRepository } from '../repositories/SupabaseRepository';
import { SedimentationService } from '../services/SedimentationService';
import { isSupabaseConfigured } from '../lib/supabase';

/**
 * Controller Hook
 * Connects View to Data/Service layers.
 * Automatically chooses between Memory (Mock) and Supabase (Real) based on env config.
 */
export const useQASystem = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [failures, setFailures] = useState<Failure[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Repository Factory Logic
  const [repo] = useState<IRepository>(() => {
    const useRealDB = isSupabaseConfigured();
    console.log(`[QA-OS] System initializing. Mode: ${useRealDB ? 'PRODUCTION (Supabase)' : 'PROTOTYPE (Memory)'}`);
    return useRealDB ? SupabaseRepository : MemoryRepository;
  });

  // Initial Load
  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [q, o, f] = await Promise.all([
        repo.getQuestions(),
        repo.getObjectives(),
        repo.getFailures()
      ]);
      setQuestions(q);
      setObjectives(o);
      setFailures(f);
    } catch (error) {
      console.error("Failed to load neural core:", error);
    } finally {
      setLoading(false);
    }
  }, [repo]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Actions
  const handleSediment = async (failureId: string) => {
    try {
      // NOTE: Service currently uses MemoryRepository hardcoded in imports in original logic. 
      // We are essentially mimicking the service layer here with the correct repo.
      
      const failure = await repo.findFailure(failureId);
      if (!failure) throw new Error("Failure not found");

      const newQuestionId = `q-sed-${Date.now()}`;
      const newQuestion: Question = {
        id: newQuestionId,
        type: 'QUESTION' as any,
        title: `Analysis: ${failure.description.substring(0, 40)}...`,
        content: `### Root Cause Analysis\n\n${failure.analysis5W2H}\n\n*Sedimented from Failure ${failure.id}*`,
        level: 0,
        tags: ['Sediment', 'Auto-Generated'],
        linkedQuestionIds: [],
        linkedOKRIds: failure.relatedKRId ? [failure.relatedKRId] : [],
        status: 'Draft',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await repo.addQuestion(newQuestion);
      await repo.updateFailure(failureId, {
        status: 'Sedimented',
        convertedToQuestionId: newQuestionId
      });

      await refresh(); 
      return true;
    } catch (e) {
      console.error("Sedimentation failed", e);
      return false;
    }
  };

  const deleteNode = async (id: string, type: 'QUESTION' | 'OBJECTIVE') => {
    try {
      let success = false;
      if (type === 'QUESTION') {
        success = await repo.deleteQuestion(id);
      } else {
        success = await repo.deleteObjective(id);
      }
      
      if (success) {
        console.log(`[QA-OS] Deleted ${type} node: ${id}`);
        await refresh();
      }
      return success;
    } catch (e) {
      console.error("Delete failed", e);
      return false;
    }
  };

  return {
    data: { questions, objectives, failures },
    loading,
    actions: {
      sedimentFailure: handleSediment,
      deleteNode, // New Action
      refresh
    }
  };
};
