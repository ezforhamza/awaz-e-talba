import { supabase } from '@/lib/supabase';

export interface SchedulerResult {
  success: boolean;
  updates_count: number;
  updates: any[];
  schedule_status: any;
  timestamp: string;
  message: string;
  error?: string;
}

export class ElectionSchedulerService {
  private static instance: ElectionSchedulerService;
  private readonly EDGE_FUNCTION_URL = '/functions/v1/election-scheduler';

  private constructor() {}

  static getInstance(): ElectionSchedulerService {
    if (!ElectionSchedulerService.instance) {
      ElectionSchedulerService.instance = new ElectionSchedulerService();
    }
    return ElectionSchedulerService.instance;
  }

  /**
   * Trigger the backend election scheduler manually
   */
  async triggerScheduler(): Promise<SchedulerResult> {
    try {
      const { data, error } = await supabase.functions.invoke('election-scheduler', {
        method: 'POST',
      });

      if (error) {
        throw new Error(error.message);
      }

      return data;
    } catch (error) {
      console.error('Election Scheduler Error:', error);
      return {
        success: false,
        updates_count: 0,
        updates: [],
        schedule_status: null,
        timestamp: new Date().toISOString(),
        message: 'Failed to trigger election scheduler',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get election schedule status and upcoming events
   */
  async getScheduleStatus(): Promise<any> {
    try {
      const { data, error } = await supabase
        .rpc('get_election_schedule_status');

      if (error) {
        throw new Error(error.message);
      }

      return data;
    } catch (error) {
      console.error('Failed to get schedule status:', error);
      return null;
    }
  }

  /**
   * Get election schedule logs (admin only)
   */
  async getScheduleLogs(limit: number = 50): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('election_schedule_log')
        .select(`
          id,
          action_type,
          election_id,
          election_title,
          performed_at,
          details
        `)
        .order('performed_at', { ascending: false })
        .limit(limit);

      if (error) {
        throw new Error(error.message);
      }

      return data || [];
    } catch (error) {
      console.error('Failed to get schedule logs:', error);
      return [];
    }
  }

  /**
   * Force start an election (admin function)
   */
  async forceStartElection(electionId: string): Promise<any> {
    try {
      const { data, error } = await supabase
        .rpc('force_start_election', { election_id: electionId });

      if (error) {
        throw new Error(error.message);
      }

      return data;
    } catch (error) {
      console.error('Failed to force start election:', error);
      throw error;
    }
  }

  /**
   * Stop an election (admin function)
   */
  async stopElection(electionId: string): Promise<any> {
    try {
      const { data, error } = await supabase
        .rpc('stop_election', { election_id: electionId });

      if (error) {
        throw new Error(error.message);
      }

      return data;
    } catch (error) {
      console.error('Failed to stop election:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const electionSchedulerService = ElectionSchedulerService.getInstance();