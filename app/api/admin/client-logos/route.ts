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

// GET - Fetch all client logos
export async function GET(request: NextRequest) {
  const admin = await verifyAdmin(request);
  if (!admin.ok) return admin.error!;

  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = Number.parseInt(searchParams.get('page') || '1');
    const limit = Number.parseInt(searchParams.get('limit') || '50');

    const skip = (page - 1) * limit;

    const [clientLogos, total] = await Promise.all([
      ClientLogo.find().sort({ order: 1, createdAt: -1 }).skip(skip).limit(limit).lean(),
      ClientLogo.countDocuments(),
    ]);

    return NextResponse.json({
      success: true,
      data: clientLogos,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        limit,
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1,
      },
    });
  } catch (error: any) {
    console.error('Error fetching client logos:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch client logos',
        error: error.message,
      },
      { status: 500 }
    );
  }
}

// POST - Create new client logo
export async function POST(request: NextRequest) {
  const admin = await verifyAdmin(request);
  if (!admin.ok) return admin.error!;

  try {
    await connectDB();

    const formData = await request.formData();
    const name = formData.get('name') as string || 'Client Logo';
    const isActive = formData.get('isActive') === 'true';
    const order = Number.parseInt(formData.get('order') as string) || 0;
    const logoFile = formData.get('logo') as File | null;

    // Validation
    if (!logoFile) {
      return NextResponse.json(
        {
          success: false,
          message: 'Logo image is required',
        },
        { status: 400 }
      );
    }

    // Check if order already exists
    const existingOrder = await ClientLogo.findOne({ order });
    if (existingOrder) {
      return NextResponse.json(
        { success: false, message: `A client logo with order ${order} already exists` },
        { status: 400 }
      );
    }

    // Upload logo to Cloudinary
    const logoBytes = await logoFile.arrayBuffer();
    const logoBuffer = Buffer.from(logoBytes);
    const logoResult = await uploadToCloudinary(logoBuffer, `client-logos/${name.toLowerCase().replace(/\s+/g, '-')}`);

    const clientLogo = await ClientLogo.create({
      name,
      logo: logoResult.secure_url,
      isActive,
      order,
    });

    return NextResponse.json({
      success: true,
      message: 'Client logo created successfully',
      data: clientLogo,
    });
  } catch (error: any) {
    console.error('Error creating client logo:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to create client logo',
        error: error.message,
      },
      { status: 500 }
    );
  }
}

// DELETE - Delete client logo
export async function DELETE(request: NextRequest) {
  const admin = await verifyAdmin(request);
  if (!admin.ok) return admin.error!;

  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: 'Client logo ID is required',
        },
        { status: 400 }
      );
    }

    const record = await ClientLogo.findById(id);

    if (!record) {
      return NextResponse.json(
        {
          success: false,
          message: 'Client logo not found',
        },
        { status: 404 }
      );
    }

    // Delete logo from Cloudinary
    if (record.logo) {
      await deleteByUrl(record.logo);
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
