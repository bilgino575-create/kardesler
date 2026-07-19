import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { getCurrentAppUser } from "@/lib/current-user";

export async function logAudit(
  action: string,
  entityType: string,
  entityId?: string,
  metadata?: Record<string, unknown>,
) {
  const user = await getCurrentAppUser();
  await prisma.auditLog.create({
    data: {
      userId: user?.id,
      action,
      entityType,
      entityId,
      metadata: metadata as Prisma.InputJsonValue | undefined,
    },
  });
}
