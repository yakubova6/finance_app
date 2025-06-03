import React from "react";

interface CategoryManagerProps {
  selectedType: string;
  onCategorySelect: (category: any) => void;
}

export default function CategoryManager({ selectedType, onCategorySelect }: CategoryManagerProps) {
  return (
    <div className="text-center text-gray-500 py-8">
      Функция управления категориями в разработке
    </div>
  );
}