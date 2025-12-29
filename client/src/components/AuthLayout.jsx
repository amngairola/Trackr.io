import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";

export default function AuthLayout({ children, authentication = true }) {
  const navigate = useNavigate();
  const [loader, setLoader] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");

    // Case 1: Page requires Login (authentication=true), but No Token
    if (authentication && !token) {
      navigate("/login");
    }
    // Case 2: Page is Public (authentication=false), but User HAS Token
    // (e.g. User is logged in but tries to visit Register)
    else if (!authentication && token) {
      navigate("/dashboard");
    }

    setLoader(false);
  }, [authentication, navigate]);

  return loader ? <Loader2 className="animate-spin" /> : <>{children}</>;
}
