export interface UserRequest extends Request {
    user?: {
      token: string;
      id: string;
      role: string;
      project_assigned_id : string;
      username : string;
    };
  }