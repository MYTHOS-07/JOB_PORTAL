import { ApplicationDao } from "./dao/ApplicationDao";
import { CategoryDao } from "./dao/CategoryDao";
import { CompanyDao } from "./dao/CompanyDao";
import { JobDao } from "./dao/JobDao";
import { NotificationDao } from "./dao/NotificationDao";
import { UserDao } from "./dao/UserDao";
import { AdminController } from "./controllers/AdminController";
import { ApplicationController } from "./controllers/ApplicationController";
import { AuthController } from "./controllers/AuthController";
import { CategoryController } from "./controllers/CategoryController";
import { CompanyController } from "./controllers/CompanyController";
import { DashboardController } from "./controllers/DashboardController";
import { HealthController } from "./controllers/HealthController";
import { JobController } from "./controllers/JobController";
import { NotificationController } from "./controllers/NotificationController";
import { UserController } from "./controllers/UserController";
import { AuthenticateMiddleware } from "./middleware/authenticate";
import { ApplicationService } from "./services/ApplicationService";
import { AuthService } from "./services/AuthService";
import { CategoryService } from "./services/CategoryService";
import { CompanyService } from "./services/CompanyService";
import { DashboardService } from "./services/DashboardService";
import { EmailService } from "./services/EmailService";
import { JobService } from "./services/JobService";
import { NotificationService } from "./services/NotificationService";
import { PasswordResetService } from "./services/PasswordResetService";
import { TokenService } from "./services/TokenService";
import { UserService } from "./services/UserService";

/**
 * Simple composition root. One place creates DAOs, services and controllers
 * so controllers never talk to Prisma themselves.
 */
export function createAppContainer() {
  const userDao = new UserDao();
  const companyDao = new CompanyDao();
  const jobDao = new JobDao();
  const applicationDao = new ApplicationDao();
  const categoryDao = new CategoryDao();
  const notificationDao = new NotificationDao();

  const tokenService = new TokenService();
  const emailService = new EmailService();
  const passwordResetService = new PasswordResetService();
  const notificationService = new NotificationService(notificationDao);
  const authService = new AuthService(
    userDao,
    tokenService,
    passwordResetService,
    emailService,
    notificationService,
  );
  const userService = new UserService(userDao, notificationService);
  const companyService = new CompanyService(companyDao, jobDao, notificationService);
  const jobService = new JobService(
    jobDao,
    categoryDao,
    applicationDao,
    companyService,
    notificationService,
  );
  const applicationService = new ApplicationService(
    applicationDao,
    jobDao,
    userDao,
    companyService,
    emailService,
    notificationService,
  );
  const categoryService = new CategoryService(categoryDao);
  const dashboardService = new DashboardService(
    userDao,
    companyDao,
    jobDao,
    applicationDao,
    companyService,
  );

  return {
    authenticate: new AuthenticateMiddleware(tokenService, userDao),
    authController: new AuthController(authService),
    userController: new UserController(userService),
    companyController: new CompanyController(companyService),
    jobController: new JobController(jobService),
    applicationController: new ApplicationController(applicationService),
    categoryController: new CategoryController(categoryService),
    notificationController: new NotificationController(notificationService),
    adminController: new AdminController(
      userService,
      companyService,
      jobService,
      applicationService,
      dashboardService,
    ),
    dashboardController: new DashboardController(dashboardService),
    healthController: new HealthController(),
  };
}

export type AppContainer = ReturnType<typeof createAppContainer>;
