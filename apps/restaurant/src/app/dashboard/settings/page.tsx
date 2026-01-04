'use client';

import { useState, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/auth';
import { restaurantApi } from '@/lib/api';
import {
  Loader2,
  Upload,
  MapPin,
  Phone,
  Clock,
  DollarSign,
  Truck,
} from 'lucide-react';

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const { restaurant, setRestaurant } = useAuthStore();
  const imageInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);

  const uploadImageMutation = useMutation({
    mutationFn: async (file: File) => {
      setIsUploadingImage(true);
      const response = await restaurantApi.uploadImage(file);
      return response.data;
    },
    onSuccess: (data) => {
      if (restaurant && data.data?.restaurant) {
        setRestaurant({ ...restaurant, imageUrl: data.data.restaurant.imageUrl });
      }
      queryClient.invalidateQueries({ queryKey: ['restaurant-menu'] });
    },
    onSettled: () => {
      setIsUploadingImage(false);
    },
  });

  const uploadCoverMutation = useMutation({
    mutationFn: async (file: File) => {
      setIsUploadingCover(true);
      const response = await restaurantApi.uploadCover(file);
      return response.data;
    },
    onSuccess: (data) => {
      if (restaurant && data.data?.restaurant) {
        setRestaurant({ ...restaurant, coverImageUrl: data.data.restaurant.coverImageUrl });
      }
      queryClient.invalidateQueries({ queryKey: ['restaurant-menu'] });
    },
    onSettled: () => {
      setIsUploadingCover(false);
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadImageMutation.mutate(file);
    }
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadCoverMutation.mutate(file);
    }
  };

  if (!restaurant) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">პარამეტრები</h1>

      {/* Cover Image */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div
          className="h-48 bg-gray-100 relative cursor-pointer group"
          onClick={() => coverInputRef.current?.click()}
        >
          {restaurant.coverImageUrl ? (
            <img
              src={restaurant.coverImageUrl}
              alt="Cover"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center text-gray-400">
                <Upload className="w-8 h-8 mx-auto mb-2" />
                <p>დაამატეთ cover სურათი</p>
              </div>
            </div>
          )}
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            {isUploadingCover ? (
              <Loader2 className="w-8 h-8 animate-spin text-white" />
            ) : (
              <Upload className="w-8 h-8 text-white" />
            )}
          </div>
          <input
            ref={coverInputRef}
            type="file"
            accept="image/*"
            onChange={handleCoverChange}
            className="hidden"
          />
        </div>

        {/* Restaurant Info */}
        <div className="p-6">
          <div className="flex items-start gap-6">
            {/* Logo */}
            <div
              className="w-24 h-24 bg-gray-100 rounded-xl flex-shrink-0 relative cursor-pointer group overflow-hidden"
              onClick={() => imageInputRef.current?.click()}
            >
              {restaurant.imageUrl ? (
                <img
                  src={restaurant.imageUrl}
                  alt={restaurant.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Upload className="w-6 h-6 text-gray-400" />
                </div>
              )}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl">
                {isUploadingImage ? (
                  <Loader2 className="w-6 h-6 animate-spin text-white" />
                ) : (
                  <Upload className="w-6 h-6 text-white" />
                )}
              </div>
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </div>

            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900">{restaurant.name}</h2>
              {restaurant.description && (
                <p className="text-gray-500 mt-1">{restaurant.description}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <MapPin className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900">მისამართი</h3>
          </div>
          <p className="text-gray-600">{restaurant.address}</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <Phone className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900">ტელეფონი</h3>
          </div>
          <p className="text-gray-600">{restaurant.phone}</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Clock className="w-5 h-5 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900">მომზადების დრო</h3>
          </div>
          <p className="text-gray-600">{restaurant.avgPrepTime} წუთი</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Truck className="w-5 h-5 text-orange-600" />
            </div>
            <h3 className="font-semibold text-gray-900">მიტანის საფასური</h3>
          </div>
          <p className="text-gray-600">{restaurant.deliveryFee.toFixed(2)} ₾</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <DollarSign className="w-5 h-5 text-yellow-600" />
            </div>
            <h3 className="font-semibold text-gray-900">მინ. შეკვეთა</h3>
          </div>
          <p className="text-gray-600">{restaurant.minOrderAmount.toFixed(2)} ₾</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <div className={`p-2 rounded-lg ${restaurant.isActive ? 'bg-green-100' : 'bg-red-100'}`}>
              <div className={`w-3 h-3 rounded-full ${restaurant.isActive ? 'bg-green-500' : 'bg-red-500'}`} />
            </div>
            <h3 className="font-semibold text-gray-900">სტატუსი</h3>
          </div>
          <p className={restaurant.isActive ? 'text-green-600' : 'text-red-600'}>
            {restaurant.isActive ? 'აქტიური' : 'არააქტიური'}
          </p>
        </div>
      </div>

      {/* Note */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <p className="text-blue-800 text-sm">
          <strong>შენიშვნა:</strong> რესტორნის ძირითადი ინფორმაციის (სახელი, მისამართი, საფასური და ა.შ.)
          შესაცვლელად მიმართეთ ადმინისტრატორს.
        </p>
      </div>
    </div>
  );
}
