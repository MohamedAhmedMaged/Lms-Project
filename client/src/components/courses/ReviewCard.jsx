import StarRating from '../common/StarRating';

export default function ReviewCard({ review }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-semibold text-sm">
            {review.student?.firstName?.[0]}{review.student?.lastName?.[0]}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">
              {review.student?.firstName} {review.student?.lastName}
            </p>
            <p className="text-xs text-gray-400">
              {new Date(review.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        <StarRating rating={review.rating} size={14} />
      </div>
      {review.content && <p className="text-sm text-gray-600 mt-2">{review.content}</p>}
    </div>
  );
}
