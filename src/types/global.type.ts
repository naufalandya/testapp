export interface TopicSummary {
    topics_id: number;
    topics_name: string;
    total_questions: number;
    total_correct_answers: number;
    total_incorrect_answers: number;
    user_progress: number;
    topics_user_struggles_with: number;
    avg_time_taken: number;
    questions_completed_within_time: number;
    questions_exceeded_time_limit: number;
}

export interface TagPerformance {
    topics_id: number;
    topics_name: string;
    tag_id: number;
    tag_name: string;
    total_questions: number;
    total_correct_answers: number;
    total_incorrect_answers: number;
    user_progress: number;
    topics_user_struggles_with: number;
}

export type CreateTopicType = {
    title: string;
    description?: string | null;
    chapter_id: number;
};

export type CreateQuestionType = {
    title?: string | null;
    description?: string | null;
    question: string;
    subtopic_id?: number | undefined;
    difficulty_id?: number | undefined;
    explanation?: string | null;
    time_limit?: number | null;
    type_id: number;
    tag_id?: number | undefined;
    is_active?: boolean;
    created_by?: string | null;
    updated_by?: string | null;
};

export interface ApiResponse<T = any> {
    status: boolean;
    code: number;
    message: string;
    data: T;
}
