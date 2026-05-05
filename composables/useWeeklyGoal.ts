export function useWeeklyGoal() {
  const supabase = useSupabaseClient()
  const goal = ref(3)

  async function fetchGoal(userId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('weekly_workout_goal')
      .eq('id', userId)
      .single()

    if (!error && data) {
      goal.value = data.weekly_workout_goal ?? 3
    }
  }

  async function saveGoal(userId: string, value: number) {
    const { error } = await supabase
      .from('profiles')
      .update({ weekly_workout_goal: value })
      .eq('id', userId)

    if (error)
      throw error

    goal.value = value
  }

  return { goal, fetchGoal, saveGoal }
}
