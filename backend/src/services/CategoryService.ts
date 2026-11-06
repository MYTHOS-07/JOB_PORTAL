import { MESSAGES } from "../constants/messages";
import { CategoryDao } from "../dao/CategoryDao";
import { ApiError } from "../utils/ApiError";

/**
 * Public category listing and admin category management.
 */
export class CategoryService {
  constructor(private readonly categoryDao: CategoryDao) {}

  async list() {
    return this.categoryDao.list();
  }

  async getById(id: number) {
    const category = await this.categoryDao.findById(id);
    if (!category) {
      throw ApiError.notFound(MESSAGES.CATEGORY.NOT_FOUND);
    }
    return category;
  }

  async create(name: string) {
    const slug = this.toSlug(name);
    const existing = await this.categoryDao.findBySlug(slug);
    if (existing) {
      throw ApiError.conflict("A category with this name already exists.");
    }
    return this.categoryDao.create({ name, slug });
  }

  async update(id: number, name: string) {
    await this.getById(id);
    return this.categoryDao.update(id, { name, slug: this.toSlug(name) });
  }

  async delete(id: number) {
    await this.getById(id);
    return this.categoryDao.delete(id);
  }

  private toSlug(name: string): string {
    return name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  }
}
