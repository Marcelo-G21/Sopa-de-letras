import React from "react";
import { Link } from "react-router-dom";
import categories from "../data/categories";

const CategoryMenu = () => {
  return (
    <div className="flex min-h-screen flex-col p-4 text-center">
      <div className="flex flex-grow flex-col items-center justify-center">
        <h1 className="mb-8 text-2xl font-bold">Selecciona una Categoría</h1> {/* Añadido mb-8 */}
        <div className="mx-auto flex max-w-2xl flex-wrap justify-center gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.name}
              to={`/category/${cat.name}`}
              className="rounded-full bg-[#f3d2c1] px-6 py-3 text-sm text-[#001858] shadow transition-colors duration-200 hover:bg-[#a2d2ff] md:text-base">
              {cat.name}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoryMenu;
