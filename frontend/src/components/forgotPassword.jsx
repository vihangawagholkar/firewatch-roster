const ForgotPassword = () => {
    const [email, setEmail] = useState("");
  
    const handleReset = async () => {
      try {
        await axios.post("/api/auth/forgot-password", { email });
        alert("Reset link sent!");
      } catch (err) {
        alert("Failed to send reset link.");
      }
    };
  
    return (
      <div>
        <h2>Reset Password</h2>
        <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" />
        <button onClick={handleReset}>Send Reset Link</button>
      </div>
    );
  };