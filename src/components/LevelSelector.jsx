import React from "react";
import { useParams, Link, useNavigate } from "react-router-dom";

const LevelSelector = () => {
  const { name } = useParams();
  const navigate = useNavigate();
  const levels = [1, 2, 3, 4];

  return (
    <div className="flex min-h-screen flex-col p-4 text-center">
      <div className="mb-0">
        <button onClick={() => navigate("/")} className="rounded bg-[#001858] px-4 py-2 text-white">
          Categorías
        </button>
      </div>

      <div className="flex flex-grow flex-col items-center justify-center">
        <h2 className="mb-4 text-xl font-bold">Niveles de {name}</h2>
        <div className="flex flex-wrap justify-center gap-4">
          {levels.map((lvl) => (
            <Link
              key={lvl}
              to={`/category/${name}/level/${lvl}`}
              className="rounded-full bg-[#bae8e8] px-6 py-3 text-[#001858] shadow hover:bg-[#a2d2ff]">
              Nivel {lvl}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LevelSelector;
