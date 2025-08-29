export type SubIngredient = {
    sublistName: string;
    sublistId: string;
    nameOfIngredient: string;
    ingredient_id: string;
};

export type RecipeSubInstructions = {
    sublistName: string;
    sublistId: string;
    instruction: string;
    instruction_id: string;
};

export type ListNameProps = {
    name: string;
    id: string;
};

export type RecipeData = {
    categoryName: string;
    categoryId: string;
    recipeOwner: string;
    nameOfDish: string;
    difficultyLevel: string;
    timeToCook: string;
    numberOfServings: string;
    specialEquipment: string[],
    imageUrl: string;
    ingredients: string[];
    subIngredients: SubIngredient[];
    cookingInstructions: string[];
    subInstructions: RecipeSubInstructions[];
};