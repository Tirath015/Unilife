import { apiRequest } from "../api/httpClient";

export const categoryService = {
  async getAllCategories() {
    return apiRequest("/Categories", {
      method: "GET",
    });
  },

  async getCategoryById(categoryId) {
    if (!categoryId) {
      throw new Error("Category ID is required.");
    }

    return apiRequest(`/Categories/${categoryId}`, {
      method: "GET",
    });
  },

  async createCategory(name) {
    const categoryName = name?.trim();

    if (!categoryName) {
      throw new Error("Category name is required.");
    }

    return apiRequest("/Categories", {
      method: "POST",
      body: {
        name: categoryName,
      },
    });
  },

  async updateCategory(categoryId, name) {
    const categoryName = name?.trim();

    if (!categoryId) {
      throw new Error("Category ID is required.");
    }

    if (!categoryName) {
      throw new Error("Category name is required.");
    }

    return apiRequest(`/Categories/${categoryId}`, {
      method: "PUT",
      body: {
        categoryId: Number(categoryId),
        name: categoryName,
      },
    });
  },

  async deleteCategory(categoryId) {
    if (!categoryId) {
      throw new Error("Category ID is required.");
    }

    return apiRequest(`/Categories/${categoryId}`, {
      method: "DELETE",
    });
  },
};