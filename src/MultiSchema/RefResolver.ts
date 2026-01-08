import type { RefResolution, ImportInfo } from './types.js';
import { SchemaRegistry } from './SchemaRegistry.js';

/**
 * Default RefResolver implementation.
 * Handles both internal ($ref within same schema) and external references.
 */
export class DefaultRefResolver {
  private schemaRegistry: SchemaRegistry;
  private importPathTransformer?: (from: string, to: string) => string;

  constructor(schemaRegistry: SchemaRegistry, importPathTransformer?: (from: string, to: string) => string) {
    this.schemaRegistry = schemaRegistry;
    this.importPathTransformer = importPathTransformer;
  }

  /**
   * Resolve a $ref string relative to a source schema.
   * Supports both internal (#/path/to/definition) and external (schema-id#/path) references.
   *
   * @param ref - The $ref string to resolve
   * @param fromSchemaId - The schema ID where the reference originates from
   * @returns RefResolution with target info, or null if cannot be resolved
   */
  resolve(ref: string, fromSchemaId: string): RefResolution | null {
    // Handle internal reference (same schema)
    if (ref.startsWith('#')) {
      return this.resolveInternalRef(ref, fromSchemaId);
    }

    // Handle schema ID reference (no #) or file path
    // If it contains # or /, it's an external reference
    if (ref.includes('#')) {
      return this.resolveExternalRef(ref, fromSchemaId);
    }

    // Handle bare schema ID reference
    if (this.schemaRegistry.hasEntry(ref)) {
      return {
        targetSchemaId: ref,
        definitionPath: [],
        isExternal: true,
        importInfo: this.createImportInfo(ref, fromSchemaId),
      };
    }

    // Cannot resolve
    return null;
  }

  /**
   * Resolve an internal reference within the same schema.
   * Format: #/properties/id or #/definitions/User, etc.
   */
  private resolveInternalRef(ref: string, fromSchemaId: string): RefResolution {
    // Parse the path: #/path/to/definition
    const pathStr = ref.substring(2); // Remove leading #/
    const definitionPath = pathStr.split('/').filter((p) => p.length > 0);

    return {
      targetSchemaId: fromSchemaId,
      definitionPath,
      isExternal: false,
    };
  }

  /**
   * Resolve an external reference to another schema.
   * Supports formats like:
   * - "schema-id#/path" - reference to named schema with path
   * - "./other.json#/definitions/User" - file-based reference with path
   * - "../schemas/user.json#/" - relative path reference
   */
  private resolveExternalRef(ref: string, fromSchemaId: string): RefResolution | null {
    const [refTarget, pathStr] = ref.split('#');

    // Try to find the target schema
    let targetSchemaId: string | null = null;

    // First, check if refTarget is a direct schema ID
    if (this.schemaRegistry.hasEntry(refTarget)) {
      targetSchemaId = refTarget;
    } else {
      // Try to resolve as a file path relative to fromSchemaId
      targetSchemaId = this.resolveFilePath(refTarget, fromSchemaId);
    }

    if (!targetSchemaId) {
      // Cannot resolve the target
      return null;
    }

    // Parse the definition path
    const definitionPath = pathStr
      ? pathStr
          .substring(1) // Remove leading /
          .split('/')
          .filter((p) => p.length > 0)
      : [];

    return {
      targetSchemaId,
      definitionPath,
      isExternal: true,
      importInfo: this.createImportInfo(targetSchemaId, fromSchemaId),
    };
  }

  /**
   * Attempt to resolve a file path reference to a schema ID.
   * This is a basic implementation that matches file paths to registered schemas.
   */
  private resolveFilePath(filePath: string, _fromSchemaId: string): string | null {
    // Normalize the file path
    const normalized = this.normalizeFilePath(filePath);

    // Try to find a matching schema ID
    for (const schemaId of this.schemaRegistry.getAllIds()) {
      if (this.pathsMatch(normalized, schemaId)) {
        return schemaId;
      }
    }

    return null;
  }

  /**
   * Normalize a file path by removing leading ./ and ../ and normalizing slashes.
   */
  private normalizeFilePath(filePath: string): string {
    return filePath
      .replace(/^\.\//, '') // Remove leading ./
      .replace(/^\.\.\//, '') // Remove leading ../
      .replace(/\.json$/i, '') // Remove .json extension
      .replace(/\.schema\.json$/i, '') // Remove .schema.json extension
      .replace(/\\/g, '/') // Normalize backslashes
      .toLowerCase();
  }

  /**
   * Check if two paths refer to the same file.
   */
  private pathsMatch(path1: string, path2: string): boolean {
    const norm1 = this.normalizeFilePath(path1);
    const norm2 = path2.toLowerCase();
    return norm1 === norm2 || norm2.endsWith('/' + norm1) || norm1.endsWith('/' + norm2);
  }

  /**
   * Create import information for a reference to another schema.
   */
  private createImportInfo(targetSchemaId: string, fromSchemaId: string): ImportInfo {
    // Derive import name from target schema ID (last segment, PascalCase)
    const lastSegment = targetSchemaId.split('/').pop() ?? targetSchemaId;
    const importName = this.toPascalCase(lastSegment.replace(/\.[^.]+$/, '')); // Remove extension

    // Compute the module path
    let modulePath = this.computeModulePath(targetSchemaId, fromSchemaId);
    if (this.importPathTransformer) {
      modulePath = this.importPathTransformer(fromSchemaId, modulePath);
    }

    return {
      importName,
      importKind: 'named',
      modulePath,
      isTypeOnly: false,
    };
  }

  /**
   * Compute the relative module path from source to target schema.
   */
  private computeModulePath(targetSchemaId: string, fromSchemaId: string): string {
    // If both are simple IDs (no slashes), assume same directory
    if (!targetSchemaId.includes('/') && !fromSchemaId.includes('/')) {
      return `./${targetSchemaId}`;
    }

    // Extract directory paths
    const fromDir = fromSchemaId.substring(0, fromSchemaId.lastIndexOf('/'));
    const targetDir = targetSchemaId.substring(0, targetSchemaId.lastIndexOf('/'));

    // If in same directory, use relative import
    if (fromDir === targetDir) {
      const targetName = targetSchemaId.substring(targetSchemaId.lastIndexOf('/') + 1);
      return `./${targetName}`;
    }

    // Otherwise, use absolute-style import from root
    return targetSchemaId;
  }

  /**
   * Convert a string to PascalCase.
   */
  private toPascalCase(str: string): string {
    return str
      .replace(/[-_./]/g, ' ')
      .split(/\s+/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join('');
  }

  /**
   * Supports external resolvers for custom $ref handling.
   */
  supportsExternalRefs(): boolean {
    return true;
  }
}
