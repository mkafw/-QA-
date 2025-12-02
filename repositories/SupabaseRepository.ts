
import { Question, Objective, Failure, IRepository } from '../types';
import { supabase } from '../lib/supabase';

export const SupabaseRepository: IRepository = {
  // Questions
  getQuestions: async (): Promise<Question[]> => {
    if (!supabase) throw new Error("Supabase not initialized");
    const { data, error } = await supabase.from('questions').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    // Map DB columns to Domain Types if necessary (assuming 1:1 for now)
    return data as Question[];
  },
  
  addQuestion: async (question: Question): Promise<Question> => {
    if (!supabase) throw new Error("Supabase not initialized");
    const { data, error } = await supabase.from('questions').insert(question).select().single();
    if (error) throw error;
    return data as Question;
  },

  // Failures
  getFailures: async (): Promise<Failure[]> => {
    if (!supabase) throw new Error("Supabase not initialized");
    const { data, error } = await supabase.from('failures').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data as Failure[];
  },

  updateFailure: async (id: string, updates: Partial<Failure>): Promise<Failure | null> => {
    if (!supabase) throw new Error("Supabase not initialized");
    const { data, error } = await supabase.from('failures').update(updates).eq('id', id).select().single();
    if (error) throw error;
    return data as Failure;
  },

  findFailure: async (id: string): Promise<Failure | undefined> => {
    if (!supabase) throw new Error("Supabase not initialized");
    const { data } = await supabase.from('failures').select('*').eq('id', id).single();
    return data as Failure;
  },

  // Objectives
  getObjectives: async (): Promise<Objective[]> => {
    if (!supabase) throw new Error("Supabase not initialized");
    const { data, error } = await supabase.from('objectives').select('*, key_results(*)').order('created_at', { ascending: false });
    if (error) throw error;
    
    // Map Join structure if necessary
    return data.map((obj: any) => ({
      ...obj,
      keyResults: obj.key_results || []
    })) as Objective[];
  }
};
