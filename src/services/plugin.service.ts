"use server";
import prisma from "./prismaClient";

/**
 * Gets or creates a developer for a user
 */
export const getOrCreateDeveloper = async (userId: number) => {
  // Try to find existing developer
  let developer = await prisma.developer.findUnique({
    where: {
      userId,
    },
  });

  // If no developer exists, create one
  if (!developer) {
    // Make sure user exists
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new Error("User not found");
    }

    developer = await prisma.developer.create({
      data: {
        userId,
      },
    });
  }

  return developer;
};

/**
 * Creates a new plugin by a developer
 */
export const createPlugin = async ({
  userId,
  name,
  code,
}: {
  userId: number;
  name: string;
  code: string;
}) => {
  // Get or create developer for this user
  const developer = await getOrCreateDeveloper(userId);

  const plugin = await prisma.plugin.create({
    data: {
      developerId: developer.id,
      name,
      code,
    },
  });
  return plugin;
};

/**
 * Gets all plugins created by a developer
 */
export const getDeveloperPlugins = async ({
  developerId,
}: {
  developerId: number;
}) => {
  const plugins = await prisma.plugin.findMany({
    where: {
      developerId,
    },
  });
  return plugins;
};

/**
 * Gets a specific plugin by ID
 */
export const getPlugin = async ({ pluginId }: { pluginId: number }) => {
  const plugin = await prisma.plugin.findUnique({
    where: {
      id: pluginId,
    },
  });
  return plugin;
};

/**
 * Updates a plugin
 */
export const updatePlugin = async ({
  pluginId,
  name,
  code,
}: {
  pluginId: number;
  name?: string;
  code?: string;
}) => {
  // Fetch the current plugin first to get its version
  const currentPlugin = await prisma.plugin.findUnique({
    where: {
      id: pluginId,
    },
  });

  if (!currentPlugin) {
    throw new Error(`Plugin with ID ${pluginId} not found`);
  }

  // Save the current version to version history
  await prisma.pluginVersion.create({
    data: {
      pluginId,
      versionNumber: currentPlugin.version,
      name: currentPlugin.name,
      code: currentPlugin.code,
    },
  });

  const plugin = await prisma.plugin.update({
    where: {
      id: pluginId,
    },
    data: {
      name,
      code,
      version: currentPlugin.version + 1, // Increment version number
      updatedAt: new Date(),
    },
  });
  return plugin;
};

// Define the PluginVersion type to match the Prisma schema
interface PluginVersion {
  id: number;
  pluginId: number;
  versionNumber: number;
  name: string;
  code: string;
  createdAt: Date;
}

/**
 * Gets plugin version history
 */
export const getPluginVersions = async ({ pluginId }: { pluginId: number }) => {
  const versions = await prisma.pluginVersion.findMany({
    where: {
      pluginId,
    },
    orderBy: {
      versionNumber: 'desc',
    },
  });
  
  // Get current version from the plugin itself
  const currentPlugin = await prisma.plugin.findUnique({
    where: {
      id: pluginId,
    },
    select: {
      id: true,
      name: true,
      code: true,
      version: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  
  if (!currentPlugin) {
    throw new Error(`Plugin with ID ${pluginId} not found`);
  }

  // Combine current version with history
  const allVersions = [
    {
      id: 0, // Special ID for current version
      pluginId,
      versionNumber: currentPlugin.version,
      name: currentPlugin.name,
      code: currentPlugin.code,
      createdAt: currentPlugin.updatedAt,
      isCurrent: true,
    },
    ...versions.map((version: PluginVersion) => ({
      ...version,
      isCurrent: false,
    })),
  ];
  
  return allVersions;
};

/**
 * Gets a specific plugin version
 */
export const getPluginVersion = async ({
  pluginId,
  versionNumber,
}: {
  pluginId: number;
  versionNumber: number;
}) => {
  // If it's the current version, get it from the plugin table
  const currentPlugin = await prisma.plugin.findUnique({
    where: {
      id: pluginId,
    },
  });

  if (!currentPlugin) {
    throw new Error(`Plugin with ID ${pluginId} not found`);
  }

  if (versionNumber === currentPlugin.version) {
    return {
      pluginId,
      versionNumber,
      name: currentPlugin.name,
      code: currentPlugin.code,
      createdAt: currentPlugin.updatedAt,
      isCurrent: true,
    };
  }

  // Otherwise, get it from version history
  const version = await prisma.pluginVersion.findUnique({
    where: {
      pluginId_versionNumber: {
        pluginId,
        versionNumber,
      },
    },
  });

  if (!version) {
    throw new Error(`Version ${versionNumber} for plugin ID ${pluginId} not found`);
  }

  return {
    ...version,
    isCurrent: false,
  };
};

/**
 * Restore a plugin to a previous version
 */
export const restorePluginVersion = async ({
  pluginId,
  versionNumber,
}: {
  pluginId: number;
  versionNumber: number;
}) => {
  // Get the version to restore
  const version = await prisma.pluginVersion.findUnique({
    where: {
      pluginId_versionNumber: {
        pluginId,
        versionNumber,
      },
    },
  });

  if (!version) {
    throw new Error(`Version ${versionNumber} for plugin ID ${pluginId} not found`);
  }

  // Update the current plugin with the version data
  return updatePlugin({
    pluginId,
    name: version.name,
    code: version.code,
  });
};

/**
 * Gets all chatbots using a specific plugin
 */
export const getPluginChatbots = async ({ pluginId }: { pluginId: number }) => {
  const chatbotPlugins = await prisma.chatbotPlugins.findMany({
    where: {
      pluginId,
    },
    include: {
      chatbot: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
    },
  });

  return chatbotPlugins.map((cp) => cp.chatbot);
};
