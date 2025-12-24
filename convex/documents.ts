import { paginationOptsValidator } from 'convex/server';
import { ConvexError, v } from 'convex/values';

import { mutation, query } from './_generated/server';

export const create = mutation({
  args: {
    title: v.optional(v.string()),
    initialContent: v.optional(v.string()),
    roomId: v.optional(v.string()), // Add roomId to the arguments
  },
  handler: async (ctx, args) => {
    const user = await ctx.auth.getUserIdentity();

    if (!user) throw new ConvexError('Unauthorized!');

    console.log('Creating document for user:', user.subject);

    const organizationId = (user.organization_id ?? undefined) as string | undefined;

    
    if (!organizationId) {
      console.warn('User does not belong to an organization. organizationId is undefined.');
    }

    const documentId = await ctx.db.insert('documents', {
      title: args.title ?? 'Untitled Document',
      ownerId: user.subject,
      organizationId,
      roomId: args.roomId, // Add roomId here
      initialContent: args.initialContent,
    });

    return documentId;
  },
});


// export const get = query({
//   args: {
//     paginationOpts: paginationOptsValidator,
//     search: v.optional(v.string()),
//     organizationId: v.optional(v.string()), // Ensure organizationId is validated
//     ownerId: v.optional(v.string()),       // Ensure ownerId is validated
//   },
//   handler: async (ctx, { search, paginationOpts, organizationId, ownerId }) => {
//     const user = await ctx.auth.getUserIdentity();

//     if (!user) throw new ConvexError('Unauthorized!');

//     console.log('Fetching documents for user:', user.subject, 'in organization:', organizationId);

//     // Search within organization
//     if (search && organizationId) {
//       return await ctx.db
//         .query('documents')
//         .withSearchIndex('search_title', (q) => q.search('title', search).eq('organizationId', organizationId))
//         .paginate(paginationOpts);
//     }

//     // Search within personal
//     if (search && ownerId) {
//       return await ctx.db
//         .query('documents')
//         .withSearchIndex('search_title', (q) => q.search('title', search).eq('ownerId', ownerId))
//         .paginate(paginationOpts);
//     }

//     // All organization docs
//     if (organizationId) {
//       return await ctx.db
//         .query('documents')
//         .withIndex('by_organization_id', (q) => q.eq('organizationId', organizationId))
//         .paginate(paginationOpts);
//     }

//     // All personal docs
//     if (ownerId) {
//       return await ctx.db
//         .query('documents')
//         .withIndex('by_owner_id', (q) => q.eq('ownerId', ownerId))
//         .paginate(paginationOpts);
//     }

//     throw new ConvexError('Invalid query context: organizationId or ownerId must be provided.');
//   },
// });

export const get = query({
  args: {
    paginationOpts: paginationOptsValidator,
    search: v.optional(v.string()),
  },
  handler: async (ctx, { search, paginationOpts }) => {
    const user = await ctx.auth.getUserIdentity();

    if (!user) throw new ConvexError('Unauthorized!');

    const organizationId = (user.organization_id ?? undefined) as string | undefined;

    console.log('Fetching documents for user:', user.subject, 'in organization:', organizationId);

    // Search within organization
    if (search && organizationId) {
      return await ctx.db
        .query('documents')
        .withSearchIndex('search_title', (q) => q.search('title', search).eq('organizationId', organizationId))
        .paginate(paginationOpts);
    }

    // Search within personal
    if (search) {
      return await ctx.db
        .query('documents')
        .withSearchIndex('search_title', (q) => q.search('title', search).eq('ownerId', user.subject))
        .paginate(paginationOpts);
    }

    // All organization docs
    if (organizationId) {
      return await ctx.db
        .query('documents')
        .withIndex('by_organization_id', (q) => q.eq('organizationId', organizationId))
        .paginate(paginationOpts);
    }

    // All personal docs
      return await ctx.db
        .query('documents')
        .withIndex('by_owner_id', (q) => q.eq('ownerId', user.subject))
        .paginate(paginationOpts);
    
  },
});



export const getByIds = query({
  args: { ids: v.array(v.id('documents')) },
  handler: async (ctx, { ids }) => {
    const documents = [];

    for (const id of ids) {
      const document = await ctx.db.get(id);

      if (document) {
        documents.push({ id: document._id, name: document.title });
      } else {
        documents.push({ id, name: '[Removed]' });
      }
    }

    return documents;
  },
});

export const getById = query({
  args: { id: v.id('documents') },
  handler: async (ctx, { id }) => {
    const document = await ctx.db.get(id);

    if (!document) throw new ConvexError('Document not found!');

    return document;
  },
});

export const removeById = mutation({
  args: { id: v.id('documents') },
  handler: async (ctx, args) => {
    const user = await ctx.auth.getUserIdentity();

    if (!user) throw new ConvexError('Unauthorized!');

    const document = await ctx.db.get(args.id);
    if (!document) throw new ConvexError('Document not found!');

    const organizationId = (user.organization_id ?? undefined) as string | undefined;

    const isOwner = document.ownerId === user.subject;
    // const isOrganizationMember = document.organizationId === organizationId;
    const isOrganizationMember = !!(document.organizationId && document.organizationId === organizationId);


    if (!isOwner && !isOrganizationMember) throw new ConvexError('Unauthorized!');

    await ctx.db.delete(args.id);

    return args.id;
  },
});

export const updateById = mutation({
  args: { id: v.id('documents'), title: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.auth.getUserIdentity();

    if (!user) throw new ConvexError('Unauthorized!');

    const document = await ctx.db.get(args.id);
    if (!document) throw new ConvexError('Document not found!');

    const isOwner = document.ownerId === user.subject;
     const organizationId = (user.organization_id ?? undefined) as string | undefined;
    const isOrganizationMember = !!(document.organizationId && document.organizationId === organizationId);


    if (!isOwner && !isOrganizationMember) throw new ConvexError('Unauthorized!');
    

    await ctx.db.patch(args.id, { title: args.title });

    return args.id;
  },
});
