
import { MemoryRepository } from '../repositories/MemoryRepository';
import { Question, Failure, EntityType } from '../types';

/**
 * Service Layer: Encapsulates the Domain Logic for "Sedimentation"
 * Rule: When a failure is sedimented, it creates a draft Question and updates the Failure status.
 */
export const SedimentationService = {
  sedimentFailure: async (failureId: string) => {
    const failure = await MemoryRepository.findFailure(failureId);
    if (!failure) throw new Error("Failure not found");

    // 1. Create New Question Payload
    const newQuestionId = `q-sed-${Date.now()}`;
    const newQuestion: Question = {
      id: newQuestionId,
      type: EntityType.QUESTION,
      title: `Analysis: ${failure.description.substring(0, 40)}...`,
      content: `### Root Cause Analysis\n\n${failure.analysis5W2H}\n\n*Sedimented from Failure ${failure.id}*`,
      level: 0, // Default to L0
      tags: ['Sediment', 'Auto-Generated'],
      linkedQuestionIds: [],
      linkedOKRIds: failure.relatedKRId ? [failure.relatedKRId] : [],
      status: 'Draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // 2. Transaction Script (Simulated)
    await MemoryRepository.addQuestion(newQuestion);
    await MemoryRepository.updateFailure(failureId, {
      status: 'Sedimented',
      convertedToQuestionId: newQuestionId
    });

    return newQuestion;
  }
};
