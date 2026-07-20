import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/config/models/connectDB";
import Category from "@/config/utils/admin/category/categorySchema";
import { verifyAdmin } from "@/lib/admin-auth";

// PUT: Update category
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = verifyAdmin(request);
  if (!auth.ok) return auth.error!;

  try {
    await connectDB();

    const { id } = await params;
    const body = await request.json();
    const { name } = body;

    // Reject malformed ids up front — otherwise Mongoose throws a CastError
    // that surfaces as a 500 with the internal error text instead of a 404.
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Category not found" },
        { status: 404 }
      );
    }

    // Check if category exists
    const category = await Category.findById(id);
    if (!category) {
      return NextResponse.json(
        { success: false, message: "Category not found" },
        { status: 404 }
      );
    }

    // Check if name already exists (excluding current category)
    if (name) {
      const existingCategory = await Category.findOne({
        _id: { $ne: id },
        name,
      });

      if (existingCategory) {
        return NextResponse.json(
          { success: false, message: "Category with this name already exists" },
          { status: 400 }
        );
      }
    }

    // Update category
    const updatedCategory = await Category.findByIdAndUpdate(
      id,
      { name },
      { new: true, runValidators: true }
    );

    return NextResponse.json({
      success: true,
      message: "Category updated successfully",
      category: updatedCategory,
    });
  } catch (error: any) {
    console.error("Error updating category:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update category" },
      { status: 500 }
    );
  }
}

// DELETE: Delete category
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = verifyAdmin(request);
  if (!auth.ok) return auth.error!;

  try {
    await connectDB();

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Category not found" },
        { status: 404 }
      );
    }

    const category = await Category.findById(id);
    if (!category) {
      return NextResponse.json(
        { success: false, message: "Category not found" },
        { status: 404 }
      );
    }

    await Category.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error: any) {
    console.error("Error deleting category:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete category" },
      { status: 500 }
    );
  }
}
