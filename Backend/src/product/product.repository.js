const { getPrismaClient } = require('../config/supabase');

const productSelection = {
  id: true,
  title: true,
  description: true,
  detailed_specs: true,
  condition: true,
  primary_image: true,
  additional_images: true,
  created_at: true,
  updated_at: true,
  category: {
    select: {
      id: true,
      name: true,
      slug: true,
    },
  },
  seller: {
    select: {
      id: true,
      display_name: true,
    },
  },
  auctions: {
    where: { status: { in: ['SCHEDULED', 'ACTIVE'] } },
    select: {
      id: true,
      status: true,
      start_time: true,
      end_time: true,
    },
  },
};

const createProduct = (productData) => getPrismaClient().product.create({
  data: productData,
  select: productSelection,
});

const findProductById = (productId) => getPrismaClient().product.findUnique({
  where: { id: productId },
  select: productSelection,
});

const findProductsBySellerId = (sellerId) => getPrismaClient().product.findMany({
  where: { seller_id: sellerId },
  select: productSelection,
  orderBy: { created_at: 'desc' },
});

const categoryExists = async (categoryId) => {
  const category = await getPrismaClient().category.findUnique({
    where: { id: categoryId },
    select: { id: true },
  });

  return Boolean(category);
};

const updateProduct = (productId, productData) => getPrismaClient().product.update({
  where: { id: productId },
  data: productData,
  select: productSelection,
});

const deleteProduct = (productId) => getPrismaClient().product.delete({
  where: { id: productId },
  select: { id: true },
});

module.exports = {
  createProduct,
  findProductById,
  findProductsBySellerId,
  categoryExists,
  updateProduct,
  deleteProduct,
};