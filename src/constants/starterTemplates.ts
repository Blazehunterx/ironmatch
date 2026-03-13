import { WorkoutPlan } from '../types/database';

export const STARTER_TEMPLATES: WorkoutPlan[] = [
    {
        id: 'st1', name: 'Push Day (Chest/Shoulders/Tri)', author_id: 'system', target: 'Chest', exercises: [
            { id: 'st1e1', name: 'Bench Press', sets: 4, reps: 8 },
            { id: 'st1e2', name: 'Overhead Press', sets: 3, reps: 10 },
            { id: 'st1e3', name: 'Incline Dumbbell Press', sets: 3, reps: 10 },
            { id: 'st1e4', name: 'Lateral Raise', sets: 3, reps: 15 },
            { id: 'st1e5', name: 'Tricep Pushdown', sets: 3, reps: 12 },
        ], shared: false, created_at: new Date().toISOString()
    },
    {
        id: 'st2', name: 'Pull Day (Back/Biceps)', author_id: 'system', target: 'Back', exercises: [
            { id: 'st2e1', name: 'Deadlift', sets: 3, reps: 5 },
            { id: 'st2e2', name: 'Pull-ups', sets: 4, reps: 8 },
            { id: 'st2e3', name: 'Barbell Row', sets: 3, reps: 10 },
            { id: 'st2e4', name: 'Face Pull', sets: 3, reps: 15 },
            { id: 'st2e5', name: 'Barbell Curl', sets: 3, reps: 12 },
        ], shared: false, created_at: new Date().toISOString()
    },
    {
        id: 'st3', name: 'Leg Day', author_id: 'system', target: 'Legs', exercises: [
            { id: 'st3e1', name: 'Squat', sets: 4, reps: 8 },
            { id: 'st3e2', name: 'Romanian Deadlift', sets: 3, reps: 10 },
            { id: 'st3e3', name: 'Leg Press', sets: 3, reps: 12 },
            { id: 'st3e4', name: 'Leg Curl', sets: 3, reps: 12 },
            { id: 'st3e5', name: 'Calf Raise', sets: 4, reps: 15 },
        ], shared: false, created_at: new Date().toISOString()
    },
    {
        id: 'st4', name: 'Full Body Beginner', author_id: 'system', target: 'Full Body', exercises: [
            { id: 'st4e1', name: 'Squat', sets: 3, reps: 8 },
            { id: 'st4e2', name: 'Bench Press', sets: 3, reps: 8 },
            { id: 'st4e3', name: 'Barbell Row', sets: 3, reps: 10 },
            { id: 'st4e4', name: 'Overhead Press', sets: 3, reps: 10 },
            { id: 'st4e5', name: 'Plank', sets: 3, reps: 60 },
        ], shared: false, created_at: new Date().toISOString()
    },
    {
        id: 'st5', name: 'Upper Body', author_id: 'system', target: 'Chest', exercises: [
            { id: 'st5e1', name: 'Bench Press', sets: 4, reps: 8 },
            { id: 'st5e2', name: 'Pull-ups', sets: 3, reps: 8 },
            { id: 'st5e3', name: 'Overhead Press', sets: 3, reps: 10 },
            { id: 'st5e4', name: 'Cable Row', sets: 3, reps: 12 },
            { id: 'st5e5', name: 'Dips', sets: 3, reps: 12 },
        ], shared: false, created_at: new Date().toISOString()
    },
    {
        id: 'st6', name: 'CrossFit Benchmark: Murph', author_id: 'system', target: 'Full Body', exercises: [
            { id: 'st6e1', name: 'Pull-ups', sets: 1, reps: 100 },
            { id: 'st6e2', name: 'Push-ups', sets: 1, reps: 200 },
            { id: 'st6e3', name: 'Squat', sets: 1, reps: 300 },
        ], shared: false, created_at: new Date().toISOString()
    },
];
