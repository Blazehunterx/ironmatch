import { WorkoutPlan } from '../types/database';

export const SCIENCE_PACKS: WorkoutPlan[] = [
    {
        id: "sn1", 
        name: "Fundamental Hypertrophy (Novice)", 
        author_id: "jeff_nippard_inspired", 
        target: "Full Body", 
        exercises: [
            { id: "sn1e1", name: "Squat", sets: 3, reps: 5 },
            { id: "sn1e2", name: "Bench Press", sets: 3, reps: 8 },
            { id: "sn1e3", name: "Lat Pulldown", sets: 3, reps: 10 },
            { id: "sn1e4", name: "Romanian Deadlift", sets: 2, reps: 12 },
            { id: "sn1e5", name: "Lateral Raise", sets: 3, reps: 15 }
        ], 
        shared: true, 
        created_at: new Date().toISOString()
    },
    {
        id: "sn2", 
        name: "Scientific Push (Hypertrophy)", 
        author_id: "jeff_nippard_inspired", 
        target: "Chest", 
        exercises: [
            { id: "sn2e1", name: "Incline Dumbbell Press", sets: 3, reps: 10 },
            { id: "sn2e2", name: "Flat Bench Press", sets: 3, reps: 6 },
            { id: "sn2e3", name: "Dips", sets: 3, reps: 12 },
            { id: "sn2e4", name: "Cable Flyes", sets: 3, reps: 15 },
            { id: "sn2e5", name: "Skull Crushers", sets: 3, reps: 12 }
        ], 
        shared: true, 
        created_at: new Date().toISOString()
    },
    {
        id: "sn3", 
        name: "Evidence-Based Pull (Width & Thickness)", 
        author_id: "jeff_nippard_inspired", 
        target: "Back", 
        exercises: [
            { id: "sn3e1", name: "Weighted Pull-ups", sets: 3, reps: 8 },
            { id: "sn3e2", name: "Barbell Rows", sets: 3, reps: 10 },
            { id: "sn3e3", name: "One-Arm Dumbbell Row", sets: 2, reps: 12 },
            { id: "sn3e4", name: "Face Pulls", sets: 3, reps: 20 },
            { id: "sn3e5", name: "Hammer Curls", sets: 3, reps: 12 }
        ], 
        shared: true, 
        created_at: new Date().toISOString()
    }
];
