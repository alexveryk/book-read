import { AuthLayout } from "../../components/AuthLayout/AuthLayout.jsx";
import { LoginForm } from "../../components/AuthForm/LoginForm.jsx";

const LoginPage = () => {
  const quote =
    "Книги - це кораблі думки, що мандрівні хвилями часу і дбайливо несуть свій дорогоцінний вантаж від покоління до покоління.";

  return (
    <AuthLayout quote={quote}>
      <LoginForm />
    </AuthLayout>
  );
};

export default LoginPage;
