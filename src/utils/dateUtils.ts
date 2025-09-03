/**
 * Utility functions for handling date and timezone conversions
 */

/**
 * Converts UTC date string to local date string for form inputs
 */
export const formatDateForInput = (utcDateString: string): string => {
  const date = new Date(utcDateString);
  // Convert to local timezone and format for datetime-local input
  const localISOTime = new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString();
  return localISOTime.slice(0, 16);
};

/**
 * Converts local date string from form input to UTC ISO string
 */
export const convertLocalToUTC = (localDateString: string): string => {
  // Create date as local time, then convert to UTC
  const localDate = new Date(localDateString);
  return localDate.toISOString();
};

/**
 * Formats a UTC date string to display in user's local timezone
 */
export const formatDateForDisplay = (utcDateString: string, options?: Intl.DateTimeFormatOptions): string => {
  const date = new Date(utcDateString);
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
  };
  
  return date.toLocaleString(undefined, { ...defaultOptions, ...options });
};

/**
 * Formats a UTC date string to display as relative time (e.g., "2 hours ago", "in 30 minutes")
 */
export const formatRelativeTime = (utcDateString: string): string => {
  const date = new Date(utcDateString);
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffMinutes = Math.floor(Math.abs(diffMs) / (1000 * 60));
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  const isPast = diffMs < 0;
  const prefix = isPast ? '' : 'in ';
  const suffix = isPast ? ' ago' : '';

  if (diffDays > 0) {
    return `${prefix}${diffDays} day${diffDays !== 1 ? 's' : ''}${suffix}`;
  } else if (diffHours > 0) {
    return `${prefix}${diffHours} hour${diffHours !== 1 ? 's' : ''}${suffix}`;
  } else if (diffMinutes > 0) {
    return `${prefix}${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''}${suffix}`;
  } else {
    return isPast ? 'just now' : 'right now';
  }
};

/**
 * Checks if an election should be automatically started
 */
export const shouldAutoStart = (election: { status: string; start_date: string; auto_start: boolean }): boolean => {
  if (election.status !== 'draft' || !election.auto_start) {
    return false;
  }

  const now = new Date();
  const startDate = new Date(election.start_date);
  
  return now >= startDate;
};

/**
 * Checks if an election should be automatically stopped/completed
 */
export const shouldAutoStop = (election: { status: string; end_date: string }): boolean => {
  if (election.status !== 'active') {
    return false;
  }

  const now = new Date();
  const endDate = new Date(election.end_date);
  
  return now >= endDate;
};

/**
 * Gets the current status of an election based on dates and settings
 */
export const getElectionCurrentStatus = (election: {
  status: string;
  start_date: string;
  end_date: string;
  auto_start: boolean;
}): 'scheduled' | 'active' | 'completed' | 'draft' => {
  const now = new Date();
  const startDate = new Date(election.start_date);
  const endDate = new Date(election.end_date);

  // If manually set status overrides timing
  if (election.status === 'cancelled') return 'draft';
  if (election.status === 'active' && now < endDate) return 'active';
  if (election.status === 'completed') return 'completed';

  // Determine status based on timing
  if (now >= endDate) {
    return 'completed';
  } else if (now >= startDate) {
    return election.auto_start ? 'active' : (election.status === 'active' ? 'active' : 'scheduled');
  } else {
    return election.auto_start ? 'scheduled' : 'draft';
  }
};