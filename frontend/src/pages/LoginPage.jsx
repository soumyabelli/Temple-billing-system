import Background from "../components/Background";
import LoginForm from "../components/LoginForm";

const LoginPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <Background />
      <LoginForm />
    </div>
  );
};

export default LoginPage;