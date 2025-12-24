import { auth, currentUser } from '@clerk/nextjs/server';
import { Liveblocks } from '@liveblocks/node';
import { ConvexHttpClient } from 'convex/browser';
import { NextRequest, NextResponse } from 'next/server';

import { api } from '@/../convex/_generated/api';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL || 'https://neighborly-stork-249.convex.cloud');
const liveblocks = new Liveblocks({
  secret: process.env.LIVEBLOCKS_SECRET_KEY || 'sk_dev_adGzh7cicpK7sDll6fmfv_DXI45ovyGNy89KmZTudasWOR_53UYKlQ1Bo2wCSVCx',
});

export async function POST(req: NextRequest) {
  const { sessionClaims } = await auth();
  const user = await currentUser();


  if (!sessionClaims || !user) {
    console.log('Unauthorized access attempt to Liveblocks auth endpoint.');
  return new NextResponse(JSON.stringify({ error: 'Unauthorized!' }), { status: 401 });
}


  const { room } = await req.json();
  const document = await convex.query(api.documents.getById, { id: room });

  
  if (!document) {
    console.log('Document not found for room:', room);
    return new NextResponse(JSON.stringify({ error: 'Unauthorized!' }), { status: 401 });
} 

  const isOwner = document.ownerId === user.id;
  console.log('isOwner:', isOwner);
  console.log('document.organizationId:', document.organizationId);
  console.log('sessionClaims:', sessionClaims);
  if (!(sessionClaims?.o as { id: string })?.id) {
    console.warn('Session claims are missing org_id. Ensure Clerk is configured to include organization context.');
  }

  const isOrganizationMember = !!(document.organizationId && document.organizationId === (sessionClaims?.o as { id: string })?.id);
  

  console.log('Debugging Liveblocks Auth:');
  console.log('User ID:', user.id);
  console.log('Document ID:', room);
  console.log('Document Organization ID:', document.organizationId);
  console.log('Session Claims Organization ID:', sessionClaims.org_id);

  console.log('Debugging shared organization access:');
  console.log('Document Organization ID:', document.organizationId);
  console.log('Session Claims Organization ID:', sessionClaims.org_id);

  if (!isOwner && !isOrganizationMember) {
    console.log('Access denied: User is neither the owner nor a member of the organization.');
    return new NextResponse(
      JSON.stringify({
        error: 'Unauthorized! User is neither the owner nor a member of the organization.',
        details: {
          userId: user.id,
          documentId: room,
          documentOrganizationId: document.organizationId,
          sessionClaimsOrgId: sessionClaims.org_id,
        },
      }),
      { status: 401 }
    );
  }
  const name = user.fullName ?? user.primaryEmailAddress?.emailAddress ?? 'Anonymous';
  const nameToNumber = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const hue = Math.abs(nameToNumber) % 360;
  const color = `hsl(${hue}, 80%, 60%)`;

  const session = liveblocks.prepareSession(user.id, {
    userInfo: {
      name:user.fullName || 'Anonymous',
      avatar: user.imageUrl,
      color,
    },
  });

  console.log('Authorizing Liveblocks session:');
  console.log('Room ID:', room);
  console.log('User ID:', user.id);
  console.log('Session User Info:', {
    name,
    avatar: user.imageUrl,
    color,
  });

  session.allow(room, session.FULL_ACCESS);

  console.log('Session authorization details:', session);

  const { body, status } = await session.authorize();

  return new NextResponse(body, { status });
}
