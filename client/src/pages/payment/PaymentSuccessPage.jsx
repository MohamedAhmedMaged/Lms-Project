import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { paymentApi } from "../../api/paymentApi";
import { CheckCircle, XCircle, Loader } from "lucide-react";

export default function PaymentSuccessPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("loading"); // loading | success | error
  const [message, setMessage] = useState("");
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    const sessionId = searchParams.get("session_id");
    if (!sessionId) {
      setStatus("error");
      setMessage("No payment session found.");
      return;
    }

    const verify = async () => {
      try {
        const res = await paymentApi.verifyPayment(sessionId);
        const result = res.data.data;

        if (
          result.status === "completed" ||
          result.status === "already_completed"
        ) {
          setStatus("success");
          setMessage(
            "Payment successful! You are now enrolled in the course(s).",
          );
          const timer = setInterval(() => {
            setCountdown((prev) => {
              if (prev <= 1) {
                clearInterval(timer);
                navigate("/courses");
                return 0;
              }
              return prev - 1;
            });
          }, 1000);
        } else {
          setStatus("error");
          setMessage("Payment could not be verified.");
        }
      } catch (err) {
        setStatus("error");
        setMessage(
          err.response?.data?.message || "Payment verification failed.",
        );
      }
    };

    verify();
  }, [searchParams]);

  return (
    <div className="max-w-lg mx-auto px-4 py-16 text-center">
      {status === "loading" && (
        <>
          <Loader
            size={48}
            className="mx-auto text-primary-600 animate-spin mb-4"
          />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Verifying Payment...
          </h1>
          <p className="text-gray-500">
            Please wait while we confirm your payment.
          </p>
        </>
      )}

      {status === "success" && (
        <>
          <CheckCircle size={64} className="mx-auto text-green-500 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Payment Successful!
          </h1>
          <p className="text-gray-600 mb-6">{message}</p>
          <p className="text-sm text-gray-400 mb-4">
            Redirecting in {countdown}s...
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => navigate("/dashboard")}
              className="btn-primary"
            >
              Go to My Courses
            </button>
            <button
              onClick={() => navigate("/courses")}
              className="btn-secondary"
            >
              Browse More Courses
            </button>
          </div>
        </>
      )}

      {status === "error" && (
        <>
          <XCircle size={64} className="mx-auto text-red-500 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Payment Verification Failed
          </h1>
          <p className="text-gray-600 mb-6">{message}</p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => navigate("/cart")} className="btn-primary">
              Back to Cart
            </button>
            <button
              onClick={() => navigate("/courses")}
              className="btn-secondary"
            >
              Browse Courses
            </button>
          </div>
        </>
      )}
    </div>
  );
}
