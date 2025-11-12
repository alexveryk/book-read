import { RegistrationForm } from "../../components/AuthForm/RegistrationForm.jsx";
import { AuthLayout } from "../../components/AuthLayout/AuthLayout.jsx";

const RegistrationPage = () => {
  const benefits = [
    {
      title: "Books Reading",
      text: "Зручне читання та трекінг прогресу ваших книг.",
    },
    {
      title: "Допоможе вам",
      text: "Плануйте час на читання і досягайте цілей крок за кроком.",
    },
    {
      title: "Також ви зможете",
      text: "Ділитись відгуками і зберігати улюблені сторінки.",
    },
  ];

  return (
    <AuthLayout title="Books Reading" benefits={benefits}>
      <RegistrationForm />
    </AuthLayout>
  );
};

export default RegistrationPage;
