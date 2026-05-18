
export function getRemainingDaysText(dateString) {
    if (!dateString) return '';
    const end = new Date(dateString);
    end.setHours(0,0,0,0);
    const now = new Date();
    now.setHours(0,0,0,0);
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Overdue';
    if (diffDays === 0) return 'Ends today';
    if (diffDays === 1) return '1 day left';
    return `${diffDays} days left`;
}