const AuthCard = ({ title, subtitle, children }) => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="card bg-base-100 border shadow-sm">
          <div className="card-body">
            <h1 className="text-2xl font-semibold">{title}</h1>
            {subtitle ? (
              <p className="text-sm text-base-content/70">{subtitle}</p>
            ) : null}
            <div className="mt-4">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthCard;
