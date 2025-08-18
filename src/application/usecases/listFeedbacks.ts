import type {
  FeedbackRepository,
  ListFeedbacksParams,
  ListFeedbacksResult,
} from '../ports/FeedbackRepository';

export async function listFeedbacks(
  repo: FeedbackRepository,
  params: ListFeedbacksParams,
): Promise<ListFeedbacksResult> {
  return repo.list(params);
}
