import type {
    User,
    Document,
    DocumentAccess,
    DocumentVersion,
    Comment,
    Role,
} from '@prisma/client'

export type { User, Document, DocumentAccess, DocumentVersion, Comment, Role }

// Extended Types with Relations
export type DocumentWithRelations = Document & {
    owner: User
    accesses: (DocumentAccess & { user: User })[]
}

export type CommentWithAuthor = Comment & {
    author: User
}
