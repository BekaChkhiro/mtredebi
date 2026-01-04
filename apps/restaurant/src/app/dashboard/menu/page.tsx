'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { restaurantApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import {
  Loader2,
  Plus,
  Pencil,
  Trash2,
  ChevronDown,
  ChevronUp,
  GripVertical,
  X,
  Check,
  ImageIcon,
} from 'lucide-react';

interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  isAvailable: boolean;
}

interface Category {
  id: string;
  name: string;
  sortOrder: number;
  isActive: boolean;
  menuItems: MenuItem[];
}

export default function MenuPage() {
  const queryClient = useQueryClient();
  const { restaurant } = useAuthStore();
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [showAddItem, setShowAddItem] = useState<string | null>(null);

  // Form states
  const [categoryName, setCategoryName] = useState('');
  const [itemForm, setItemForm] = useState({
    name: '',
    description: '',
    price: '',
  });

  const { data, isLoading } = useQuery({
    queryKey: ['restaurant-menu', restaurant?.id],
    queryFn: () => restaurantApi.getMyRestaurant(restaurant!.id),
    enabled: !!restaurant?.id,
  });

  const categories: Category[] = data?.data?.data?.restaurant?.categories || [];

  // Mutations
  const createCategoryMutation = useMutation({
    mutationFn: (name: string) => restaurantApi.createCategory({ name }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['restaurant-menu'] });
      setNewCategoryName('');
      setShowAddCategory(false);
    },
  });

  const updateCategoryMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { name?: string; isActive?: boolean } }) =>
      restaurantApi.updateCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['restaurant-menu'] });
      setEditingCategory(null);
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: (id: string) => restaurantApi.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['restaurant-menu'] });
    },
  });

  const createItemMutation = useMutation({
    mutationFn: (data: { categoryId: string; name: string; description?: string; price: number }) =>
      restaurantApi.createMenuItem(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['restaurant-menu'] });
      setShowAddItem(null);
      setItemForm({ name: '', description: '', price: '' });
    },
  });

  const updateItemMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { name?: string; description?: string; price?: number; isAvailable?: boolean } }) =>
      restaurantApi.updateMenuItem(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['restaurant-menu'] });
      setEditingItem(null);
    },
  });

  const deleteItemMutation = useMutation({
    mutationFn: (id: string) => restaurantApi.deleteMenuItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['restaurant-menu'] });
    },
  });

  const toggleCategory = (id: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedCategories(newExpanded);
  };

  const handleAddCategory = () => {
    if (newCategoryName.trim()) {
      createCategoryMutation.mutate(newCategoryName.trim());
    }
  };

  const handleAddItem = (categoryId: string) => {
    if (itemForm.name.trim() && itemForm.price) {
      createItemMutation.mutate({
        categoryId,
        name: itemForm.name.trim(),
        description: itemForm.description.trim() || undefined,
        price: parseFloat(itemForm.price),
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">მენიუ</h1>
        <button
          onClick={() => setShowAddCategory(true)}
          className="bg-primary-500 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 hover:bg-primary-600 transition-colors"
        >
          <Plus className="w-5 h-5" />
          კატეგორია
        </button>
      </div>

      {/* Add Category Modal */}
      {showAddCategory && (
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="კატეგორიის სახელი"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              autoFocus
            />
            <button
              onClick={handleAddCategory}
              disabled={createCategoryMutation.isPending || !newCategoryName.trim()}
              className="bg-primary-500 text-white p-2 rounded-lg hover:bg-primary-600 disabled:opacity-50"
            >
              {createCategoryMutation.isPending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Check className="w-5 h-5" />
              )}
            </button>
            <button
              onClick={() => {
                setShowAddCategory(false);
                setNewCategoryName('');
              }}
              className="p-2 text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Categories */}
      {categories.length === 0 ? (
        <div className="bg-white rounded-xl p-8 text-center text-gray-500 shadow-sm">
          კატეგორიები არ არის. დაამატეთ პირველი კატეგორია.
        </div>
      ) : (
        <div className="space-y-4">
          {categories.map((category) => {
            const isExpanded = expandedCategories.has(category.id);
            const isEditing = editingCategory === category.id;

            return (
              <div
                key={category.id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
              >
                {/* Category Header */}
                <div className="p-4 flex items-center gap-4">
                  <GripVertical className="w-5 h-5 text-gray-300 cursor-grab" />

                  {isEditing ? (
                    <input
                      type="text"
                      value={categoryName}
                      onChange={(e) => setCategoryName(e.target.value)}
                      className="flex-1 px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                      autoFocus
                    />
                  ) : (
                    <button
                      onClick={() => toggleCategory(category.id)}
                      className="flex-1 flex items-center gap-2 text-left"
                    >
                      <span className="font-semibold text-gray-900">{category.name}</span>
                      <span className="text-sm text-gray-500">
                        ({category.menuItems?.length || 0})
                      </span>
                      {!category.isActive && (
                        <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded">
                          არააქტიური
                        </span>
                      )}
                    </button>
                  )}

                  <div className="flex items-center gap-2">
                    {isEditing ? (
                      <>
                        <button
                          onClick={() => {
                            updateCategoryMutation.mutate({
                              id: category.id,
                              data: { name: categoryName },
                            });
                          }}
                          disabled={updateCategoryMutation.isPending}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setEditingCategory(null)}
                          className="p-2 text-gray-500 hover:bg-gray-50 rounded-lg"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => {
                            setEditingCategory(category.id);
                            setCategoryName(category.name);
                          }}
                          className="p-2 text-gray-500 hover:bg-gray-50 rounded-lg"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('ნამდვილად გსურთ წაშლა?')) {
                              deleteCategoryMutation.mutate(category.id);
                            }
                          }}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => toggleCategory(category.id)}
                          className="p-2 text-gray-500 hover:bg-gray-50 rounded-lg"
                        >
                          {isExpanded ? (
                            <ChevronUp className="w-5 h-5" />
                          ) : (
                            <ChevronDown className="w-5 h-5" />
                          )}
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Menu Items */}
                {isExpanded && (
                  <div className="border-t border-gray-100">
                    {category.menuItems?.length === 0 ? (
                      <div className="p-4 text-center text-gray-500 text-sm">
                        პროდუქტები არ არის
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-100">
                        {category.menuItems?.map((item) => (
                          <div key={item.id} className="p-4 flex items-center gap-4">
                            <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                              {item.imageUrl ? (
                                <img
                                  src={item.imageUrl}
                                  alt={item.name}
                                  className="w-full h-full object-cover rounded-lg"
                                />
                              ) : (
                                <ImageIcon className="w-6 h-6 text-gray-400" />
                              )}
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <h4 className="font-medium text-gray-900">{item.name}</h4>
                                {!item.isAvailable && (
                                  <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded">
                                    არ არის
                                  </span>
                                )}
                              </div>
                              {item.description && (
                                <p className="text-sm text-gray-500 truncate">{item.description}</p>
                              )}
                            </div>

                            <div className="text-right">
                              <p className="font-bold text-gray-900">{item.price.toFixed(2)} ₾</p>
                            </div>

                            <div className="flex items-center gap-1">
                              <button
                                onClick={() =>
                                  updateItemMutation.mutate({
                                    id: item.id,
                                    data: { isAvailable: !item.isAvailable },
                                  })
                                }
                                className={`p-2 rounded-lg ${
                                  item.isAvailable
                                    ? 'text-green-600 hover:bg-green-50'
                                    : 'text-gray-400 hover:bg-gray-50'
                                }`}
                              >
                                <Check className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm('ნამდვილად გსურთ წაშლა?')) {
                                    deleteItemMutation.mutate(item.id);
                                  }
                                }}
                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Add Item Form */}
                    {showAddItem === category.id ? (
                      <div className="p-4 bg-gray-50 border-t border-gray-100">
                        <div className="space-y-3">
                          <input
                            type="text"
                            value={itemForm.name}
                            onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
                            placeholder="პროდუქტის სახელი"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                          />
                          <input
                            type="text"
                            value={itemForm.description}
                            onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
                            placeholder="აღწერა (არასავალდებულო)"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                          />
                          <input
                            type="number"
                            value={itemForm.price}
                            onChange={(e) => setItemForm({ ...itemForm, price: e.target.value })}
                            placeholder="ფასი"
                            step="0.01"
                            min="0"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleAddItem(category.id)}
                              disabled={createItemMutation.isPending || !itemForm.name || !itemForm.price}
                              className="flex-1 bg-primary-500 text-white py-2 rounded-lg font-medium hover:bg-primary-600 disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                              {createItemMutation.isPending ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                              ) : (
                                'დამატება'
                              )}
                            </button>
                            <button
                              onClick={() => {
                                setShowAddItem(null);
                                setItemForm({ name: '', description: '', price: '' });
                              }}
                              className="px-4 py-2 text-gray-500 hover:text-gray-700"
                            >
                              გაუქმება
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setShowAddItem(category.id)}
                        className="w-full p-4 text-primary-500 hover:bg-primary-50 transition-colors flex items-center justify-center gap-2 border-t border-gray-100"
                      >
                        <Plus className="w-5 h-5" />
                        პროდუქტის დამატება
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
