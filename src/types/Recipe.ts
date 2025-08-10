export type SubIngredient = {
    sublistName: string;
    sublistId: string;
    nameOfIngredient: string;
    ingredient_id: string;
};

export type RecipeSubDirections = {
    sublistName: string;
    sublistId: string;
    direction: string;
    direction_id: string;
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
    ingredients: string[];
    subIngredients: SubIngredient[];
    cookingDirections: string[];
    subDirections: RecipeSubDirections[];
};