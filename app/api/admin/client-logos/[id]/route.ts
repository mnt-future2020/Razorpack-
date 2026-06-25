import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/config/models/connectDB';
import ClientLogo from '@/config/utils/admin/clientLogo/clientLogoSchema';
import { uploadToCloudinary, deleteByUrl } from '@/config/utils/cloudinary';
import jwt from 'jsonwebtoken';

interface DecodedToken {
  adminId: string;
  email: string;
  role: string;
}

// Helper function to verify admin token
async function verifyAdmin(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return {
      ok: false as const,
      error: NextResponse.json(
        { success: false, message: 'Authorization header required' },
        { status: 401 }
      ),
    };
  }
  if (!process.env.JWT_SECRET) {
    return {
      ok: false as const,
      error: NextResponse.json(
        { success: false, message: 'JWT_SECRET not configured' },
        { status: 500 }
      ),
    };
  }
  try {
    const token = authHeader.substring(7);
    jwt.verify(token, process.env.JWT_SECRET) as DecodedToken;
    return { ok: true as const };
  } catch {
    return {
      ok: false as const,
      error: NextResponse.json(
        { success: false, message: 'Invalid or expired token' },
        { status: 401 }
      ),
    };
  }
}

// GET - Fetch single client logo
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await verifyAdmin(request);
  if (!admin.ok) return admin.error!;

  try {
    await connectDB();
    const { id } = await params;

    const clientLogo = await ClientLogo.findById(id);

    if (!clientLogo) {
      return NextResponse.json(
        {
          success: false,
          message: 'Client logo not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: clientLogo,
    });
  } catch (error: any) {
    console.error('Error fetching client logo:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch client logo',
        error: error.message,
      },
      { status: 500 }
    );
  }
}

// PUT - Update client logo
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await verifyAdmin(request);
  if (!admin.ok) return admin.error!;

  try {
    await connectDB();
    const { id } = await params;

    const formData = await request.formData();
    const name = formData.get('name') as string || 'Client Logo';
    const isActive = formData.get('isActive') === 'true';
    const order = Number.parseInt(formData.get('order') as string) || 0;
    const logoFile = formData.get('logo') as File | null;
    const existingLogo = formData.get('existingLogo') as string | null;

    const existingClientLogo = await ClientLogo.findById(id);

    if (!existingClientLogo) {
      return NextResponse.json(
        {
          success: false,
          message: 'Client logo not found',
        },
        { status: 404 }
      );
    }

    // Check if order already exists (excluding current item)
    const existingOrder = await ClientLogo.findOne({
      order,
      _id: { $ne: id },
    });
    if (existingOrder) {
      return NextResponse.json(
        { success: false, message: `A client logo with order ${order} already exists` },
        { status: 400 }
      );
    }

    const oldLogoUrl = existingClientLogo.logo;
    let logoUrl = existingLogo || existingClientLogo.logo;

    // Upload new logo if provided
    if (logoFile) {
      const logoBytes = await logoFile.arrayBuffer();
      const logoBuffer = Buffer.from(logoBytes);
      const logoResult = await uploadToCloudinary(
        logoBuffer,
        `client-logos/${name.toLowerCase().replace(/\s+/g, '-')}`
      );
      logoUrl = logoResult.secure_url;
      // Delete old logo from Cloudinary if it was replaced
      if (oldLogoUrl && oldLogoUrl !== logoUrl) {
        await deleteByUrl(oldLogoUrl);
      }
    }

    const updatedLogo = await ClientLogo.findByIdAndUpdate(
      id,
      {
        name,
        logo: logoUrl,
        isActive,
        order,
      },
      { new: true, runValidators: true }
    );

    return NextResponse.json({
      success: true,
      message: 'Client logo updated successfully',
      data: updatedLogo,
    });
  } catch (error: any) {
    console.error('Error updating client logo:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to update client logo',
        error: error.message,
      },
      { status: 500 }
    );
  }
}

// DELETE - Delete single client logo
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await verifyAdmin(request);
  if (!admin.ok) return admin.error!;

  try {
    await connectDB();
    const { id } = await params;

    const clientLogo = await ClientLogo.findById(id);

    if (!clientLogo) {
      return NextResponse.json(
        {
          success: false,
          message: 'Client logo not found',
        },
        { status: 404 }
      );
    }

    // Delete logo from Cloudinary before removing the record
    if (clientLogo.logo) {
      await deleteByUrl(clientLogo.logo);
    }

    await ClientLogo.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: 'Client logo deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting client logo:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to delete client logo',
        error: error.message,
      },
      { status: 500 }
    );
  }
}
