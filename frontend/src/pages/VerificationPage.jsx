import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const VerificationPage = () => {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");

    if (token) {
      // Verificar el token con el backend
      fetch(`http://localhost:8081/auth/validate-token?token=${token}`)
        .then((response) => {
          if (response.ok) {
            setIsAuthorized(true);
          } else {
            navigate("/404", { replace: true });
          }
        })
        .catch(() => navigate("/404", { replace: true }));
    } else {
      navigate("/404", { replace: true });
    }
  }, [location, navigate]);

  if (!isAuthorized) {
    return null; // No muestra nada hasta validar
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <h1 className="text-4xl font-bold text-green-600 mb-4">
        Verification Successful!
      </h1>
      <p className="text-lg text-gray-700">
        Your email has been verified successfully. You can close this page now.
      </p>
    </div>
  );
};

export default VerificationPage;
