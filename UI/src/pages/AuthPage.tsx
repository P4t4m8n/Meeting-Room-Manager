import IconGoogle from "../components/Icons/IconGoogle";

export default function AuthPage() {
  return (
    <main className="h-screen flex justify-center">
      <div className="flex flex-col justify-center h-full p-12 gap-12 w-full max-w-120">
        <h2 className="text-4xl">התחברות</h2>
        <p className="text-xl">
          <span className="font-bold text-blue-700 text-2xl">ברוך הבא </span>
          <span>אנא התחבר באמצעות חשבון Google שלך כדי להמשיך.</span>
        </p>
        <a
          href={GOOGLE_AUTH_URL}
          className="mt-36 bg-blue-700 p-4 rounded-lg inline-flex text-white items-center justify-center gap-4 hover:bg-blue-800 transition-colors"
        >
          <IconGoogle className="h-6 w-6 aspect-square" />
        </a>
      </div>
    </main>
  );
}

const GOOGLE_AUTH_URL = `http://localhost:5228/api/auth/google`;
