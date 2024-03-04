import { useEffect, useState } from "react";
import { useCallback } from "react";
import useRazorpay from "react-razorpay";
import { axiosInstance } from "../api/axios";

export default function Home() {
  const [Razorpay] = useRazorpay();
  const [orderId, setOrderId] = useState('');
  const handlePayment = useCallback(() => {
    const options = {
      key: "rzp_test_dKsNwz2IzPfCKz",
      amount: "3000",
      currency: "INR",
      name: "X.com",
      description: "Test Transaction",
      image: "https://example.com/your_logo",
      order_id: orderId,
      handler: (res) => {
        console.log(res);
      },
      prefill: {
        name: "Sikandar Chauhan",
        email: "sikandarc989@gmail.com",
        contact: "8108595506",
      },
      notes: {
        address: "Razorpay Corporate Office",
      },
      theme: {
        color: "#3399cc",
      },
    };

    const rzpay = new Razorpay(options);
    rzpay.open();
  }, [Razorpay, orderId]);

  useEffect(() => {
    (async () => {
      try {
        const response = await axiosInstance.get("/order-creation");
        console.log(response.data.order.id);
        setOrderId(response.data.order.id);
      } catch (error) {
        console.log("error: ", error.message);
      }
    })();
  }, []);

  return (
    <div className="App">
      <button className="bg-teal-400 p-3 rounded-md" onClick={handlePayment}>Pay Now</button>
    </div>
  );
}
