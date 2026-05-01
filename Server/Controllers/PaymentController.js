import { paymentService } from "../Services/PaymentService.js";
import { catchAsync } from "../Utils/catchAsync.js";

class PaymentController {
  CreateCheckout = catchAsync(async (req, res) => {
    const result = await paymentService.CreateCheckoutSession(
      req.user.id,
      req.user.email,
    );

    res.status(200).json({
      status: "success",
      data: result,
    });
  });

  VerifyPayment = catchAsync(async (req, res) => {
    const { session_id } = req.body;
    const result = await paymentService.VerifyAndCompletePayment(session_id);

    res.status(200).json({
      status: "success",
      data: result,
    });
  });

  GetPaymentHistory = catchAsync(async (req, res) => {
    const payments = await paymentService.GetPaymentHistory(req.user.id);

    res.status(200).json({
      status: "success",
      results: payments.length,
      data: payments,
    });
  });

  GetPaymentById = catchAsync(async (req, res) => {
    const payment = await paymentService.GetPaymentById(
      req.params.id,
      req.user.id,
    );

    res.status(200).json({
      status: "success",
      data: payment,
    });
  });

  ProcessRefund = catchAsync(async (req, res) => {
    const { reason } = req.body;
    const result = await paymentService.ProcessRefund(
      req.params.id,
      req.user.id,
      reason,
    );

    res.status(200).json({
      status: "success",
      data: result,
    });
  });
}

export const paymentController = new PaymentController();
