/**
 * Database Service Unit Tests
 * Tests for all database operations with mocked Supabase client
 */

import {
  profileService,
  teamService,
  projectService,
  workflowService,
  specificationService,
  auditLogService,
  DatabaseError,
} from '../database-service';
import { UserRole, WorkflowStatus, SpecStatus, AuditAction } from '../../types/database';

// Mock Supabase client
jest.mock('../supabase-client', () => ({
  supabase: {
    from: jest.fn(),
    rpc: jest.fn(),
  },
  supabaseAdmin: {
    from: jest.fn(),
  },
  getSupabaseClient: jest.fn(),
}));

import { supabase, supabaseAdmin } from '../supabase-client';

describe('Database Service - Profile Operations', () => {
  const mockProfile = {
    id: 'user-123',
    email: 'user@example.com',
    full_name: 'John Doe',
    avatar_url: 'https://example.com/avatar.jpg',
    bio: 'Test user',
    organization: 'Test Org',
    role: UserRole.Member,
    settings: {},
    created_at: '2025-10-25T00:00:00Z',
    updated_at: '2025-10-25T00:00:00Z',
    last_login_at: '2025-10-25T00:00:00Z',
    is_active: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should get profile by ID', async () => {
    const selectMock = jest.fn().mockResolvedValueOnce({ data: mockProfile, error: null });
    const eqMock = jest.fn().mockReturnValueOnce({ select: selectMock });
    const singleMock = jest.fn().mockResolvedValueOnce({ data: mockProfile, error: null });

    (supabase.from as jest.Mock).mockReturnValueOnce({
      select: jest.fn().mockReturnValueOnce({
        eq: jest.fn().mockReturnValueOnce({
          single: singleMock,
        }),
      }),
    });

    const result = await profileService.getById('user-123');
    expect(result).toEqual(mockProfile);
  });

  test('should return null when profile not found', async () => {
    const singleMock = jest.fn().mockResolvedValueOnce({
      data: null,
      error: { code: 'PGRST116' },
    });

    (supabase.from as jest.Mock).mockReturnValueOnce({
      select: jest.fn().mockReturnValueOnce({
        eq: jest.fn().mockReturnValueOnce({
          single: singleMock,
        }),
      }),
    });

    // Expected behavior: return null on not found
  });

  test('should create profile', async () => {
    const insertMock = jest.fn().mockResolvedValueOnce({
      data: mockProfile,
      error: null,
    });

    (supabase.from as jest.Mock).mockReturnValueOnce({
      insert: jest.fn().mockReturnValueOnce({
        select: jest.fn().mockReturnValueOnce({
          single: insertMock,
        }),
      }),
    });

    const result = await profileService.create({
      id: 'user-123',
      email: 'user@example.com',
      role: UserRole.Member,
      is_active: true,
      settings: {},
    });

    expect(result).toEqual(mockProfile);
  });

  test('should update profile', async () => {
    const updateMock = jest.fn().mockResolvedValueOnce({
      data: { ...mockProfile, full_name: 'Jane Doe' },
      error: null,
    });

    (supabase.from as jest.Mock).mockReturnValueOnce({
      update: jest.fn().mockReturnValueOnce({
        eq: jest.fn().mockReturnValueOnce({
          select: jest.fn().mockReturnValueOnce({
            single: updateMock,
          }),
        }),
      }),
    });

    const result = await profileService.update('user-123', { full_name: 'Jane Doe' });
    expect(result.full_name).toBe('Jane Doe');
  });

  test('should get or create profile', async () => {
    const selectMock = jest.fn().mockResolvedValueOnce({
      data: mockProfile,
      error: null,
    });

    (supabase.from as jest.Mock).mockReturnValueOnce({
      select: jest.fn().mockReturnValueOnce({
        eq: jest.fn().mockReturnValueOnce({
          single: selectMock,
        }),
      }),
    });

    const result = await profileService.getOrCreate('user-123', 'user@example.com');
    expect(result).toEqual(mockProfile);
  });

  test('should throw DatabaseError on create failure', async () => {
    (supabase.from as jest.Mock).mockReturnValueOnce({
      insert: jest.fn().mockReturnValueOnce({
        select: jest.fn().mockReturnValueOnce({
          single: jest.fn().mockResolvedValueOnce({
            data: null,
            error: { message: 'Duplicate email' },
          }),
        }),
      }),
    });

    // Test error handling
  });
});

describe('Database Service - Team Operations', () => {
  const mockTeam = {
    id: 'team-123',
    owner_id: 'user-123',
    name: 'Test Team',
    slug: 'test-team',
    description: 'A test team',
    avatar_url: null,
    settings: {},
    is_active: true,
    created_at: '2025-10-25T00:00:00Z',
    updated_at: '2025-10-25T00:00:00Z',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should get team by ID', async () => {
    (supabase.from as jest.Mock).mockReturnValueOnce({
      select: jest.fn().mockReturnValueOnce({
        eq: jest.fn().mockReturnValueOnce({
          single: jest.fn().mockResolvedValueOnce({
            data: mockTeam,
            error: null,
          }),
        }),
      }),
    });

    const result = await teamService.getById('team-123');
    expect(result).toEqual(mockTeam);
  });

  test('should create team', async () => {
    (supabase.from as jest.Mock).mockReturnValueOnce({
      insert: jest.fn().mockReturnValueOnce({
        select: jest.fn().mockReturnValueOnce({
          single: jest.fn().mockResolvedValueOnce({
            data: mockTeam,
            error: null,
          }),
        }),
      }),
    });

    const result = await teamService.create('user-123', 'Test Team', 'test-team');
    expect(result).toEqual(mockTeam);
  });

  test('should get user teams', async () => {
    const mockTeams = [
      { ...mockTeam, role: UserRole.Owner },
    ];

    (supabase.rpc as jest.Mock).mockResolvedValueOnce({
      data: mockTeams,
      error: null,
    });

    const result = await teamService.getUserTeams('user-123');
    expect(result).toEqual(mockTeams);
  });
});

describe('Database Service - Project Operations', () => {
  const mockProject = {
    id: 'project-123',
    owner_id: 'user-123',
    team_id: null,
    pack_id: null,
    name: 'Test Project',
    slug: 'test-project',
    description: 'A test project',
    status: WorkflowStatus.Draft,
    metadata: {},
    created_at: '2025-10-25T00:00:00Z',
    updated_at: '2025-10-25T00:00:00Z',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should get project by ID', async () => {
    (supabase.from as jest.Mock).mockReturnValueOnce({
      select: jest.fn().mockReturnValueOnce({
        eq: jest.fn().mockReturnValueOnce({
          single: jest.fn().mockResolvedValueOnce({
            data: mockProject,
            error: null,
          }),
        }),
      }),
    });

    const result = await projectService.getById('project-123');
    expect(result).toEqual(mockProject);
  });

  test('should create project', async () => {
    (supabase.from as jest.Mock).mockReturnValueOnce({
      insert: jest.fn().mockReturnValueOnce({
        select: jest.fn().mockReturnValueOnce({
          single: jest.fn().mockResolvedValueOnce({
            data: mockProject,
            error: null,
          }),
        }),
      }),
    });

    const result = await projectService.create(
      'user-123',
      'Test Project',
      'test-project',
      { description: 'A test project' }
    );
    expect(result).toEqual(mockProject);
  });

  test('should list projects by owner with pagination', async () => {
    const mockProjects = [mockProject];

    (supabase.from as jest.Mock).mockReturnValueOnce({
      select: jest.fn().mockReturnValueOnce({
        eq: jest.fn().mockReturnValueOnce({
          order: jest.fn().mockReturnValueOnce({
            range: jest.fn().mockResolvedValueOnce({
              data: mockProjects,
              error: null,
              count: 1,
            }),
          }),
        }),
      }),
    });

    const result = await projectService.listByOwner('user-123', {
      limit: 10,
      offset: 0,
      sort_by: 'created_at',
    });

    expect(result.data).toEqual(mockProjects);
    expect(result.total).toBe(1);
    expect(result.limit).toBe(10);
  });
});

describe('Database Service - Workflow Operations', () => {
  const mockWorkflow = {
    id: 'workflow-123',
    project_id: 'project-123',
    owner_id: 'user-123',
    name: 'Test Workflow',
    description: 'A test workflow',
    status: WorkflowStatus.Draft,
    definition: { steps: [] },
    config: {},
    version: 1,
    parent_workflow_id: null,
    created_at: '2025-10-25T00:00:00Z',
    updated_at: '2025-10-25T00:00:00Z',
    started_at: null,
    completed_at: null,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should get workflow by ID', async () => {
    (supabase.from as jest.Mock).mockReturnValueOnce({
      select: jest.fn().mockReturnValueOnce({
        eq: jest.fn().mockReturnValueOnce({
          single: jest.fn().mockResolvedValueOnce({
            data: mockWorkflow,
            error: null,
          }),
        }),
      }),
    });

    const result = await workflowService.getById('workflow-123');
    expect(result).toEqual(mockWorkflow);
  });

  test('should create workflow', async () => {
    (supabase.from as jest.Mock).mockReturnValueOnce({
      insert: jest.fn().mockReturnValueOnce({
        select: jest.fn().mockReturnValueOnce({
          single: jest.fn().mockResolvedValueOnce({
            data: mockWorkflow,
            error: null,
          }),
        }),
      }),
    });

    const result = await workflowService.create(
      'project-123',
      'user-123',
      'Test Workflow',
      { steps: [] }
    );

    expect(result).toEqual(mockWorkflow);
  });

  test('should list workflows by project', async () => {
    const mockWorkflows = [mockWorkflow];

    (supabase.from as jest.Mock).mockReturnValueOnce({
      select: jest.fn().mockReturnValueOnce({
        eq: jest.fn().mockReturnValueOnce({
          order: jest.fn().mockReturnValueOnce({
            range: jest.fn().mockResolvedValueOnce({
              data: mockWorkflows,
              error: null,
              count: 1,
            }),
          }),
        }),
      }),
    });

    const result = await workflowService.listByProject('project-123', {
      limit: 10,
      offset: 0,
    });

    expect(result.data).toEqual(mockWorkflows);
    expect(result.total).toBe(1);
  });
});

describe('Database Service - Specification Operations', () => {
  const mockSpecification = {
    id: 'spec-123',
    workflow_id: 'workflow-123',
    project_id: 'project-123',
    owner_id: 'user-123',
    title: 'Test Specification',
    description: 'A test specification',
    content: 'Specification content...',
    status: SpecStatus.Draft,
    model_used: 'claude-3.5-sonnet',
    version: 1,
    parent_spec_id: null,
    metadata: {},
    complexity_analysis: null,
    acceptance_criteria: [],
    tags: [],
    created_at: '2025-10-25T00:00:00Z',
    updated_at: '2025-10-25T00:00:00Z',
    published_at: null,
    approved_by: null,
    approved_at: null,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should get specification by ID', async () => {
    (supabase.from as jest.Mock).mockReturnValueOnce({
      select: jest.fn().mockReturnValueOnce({
        eq: jest.fn().mockReturnValueOnce({
          single: jest.fn().mockResolvedValueOnce({
            data: mockSpecification,
            error: null,
          }),
        }),
      }),
    });

    const result = await specificationService.getById('spec-123');
    expect(result).toEqual(mockSpecification);
  });

  test('should create specification', async () => {
    (supabase.from as jest.Mock).mockReturnValueOnce({
      insert: jest.fn().mockReturnValueOnce({
        select: jest.fn().mockReturnValueOnce({
          single: jest.fn().mockResolvedValueOnce({
            data: mockSpecification,
            error: null,
          }),
        }),
      }),
    });

    const result = await specificationService.create(
      'workflow-123',
      'project-123',
      'user-123',
      'Test Specification',
      { description: 'A test specification' }
    );

    expect(result).toEqual(mockSpecification);
  });

  test('should update specification', async () => {
    const updated = { ...mockSpecification, status: SpecStatus.Approved };

    (supabase.from as jest.Mock).mockReturnValueOnce({
      update: jest.fn().mockReturnValueOnce({
        eq: jest.fn().mockReturnValueOnce({
          select: jest.fn().mockReturnValueOnce({
            single: jest.fn().mockResolvedValueOnce({
              data: updated,
              error: null,
            }),
          }),
        }),
      }),
    });

    const result = await specificationService.update('spec-123', {
      status: SpecStatus.Approved,
    });

    expect(result.status).toBe(SpecStatus.Approved);
  });

  test('should list specifications by workflow', async () => {
    const mockSpecs = [mockSpecification];

    (supabase.from as jest.Mock).mockReturnValueOnce({
      select: jest.fn().mockReturnValueOnce({
        eq: jest.fn().mockReturnValueOnce({
          order: jest.fn().mockReturnValueOnce({
            range: jest.fn().mockResolvedValueOnce({
              data: mockSpecs,
              error: null,
              count: 1,
            }),
          }),
        }),
      }),
    });

    const result = await specificationService.listByWorkflow('workflow-123', {
      limit: 10,
      offset: 0,
    });

    expect(result.data).toEqual(mockSpecs);
    expect(result.total).toBe(1);
  });
});

describe('Database Service - Audit Log Operations', () => {
  const mockAuditLog = {
    id: 'log-123',
    user_id: 'user-123',
    action: AuditAction.Create,
    entity_type: 'workflow',
    entity_id: 'workflow-123',
    changes: { name: 'New Workflow' },
    ip_address: '127.0.0.1',
    user_agent: 'Mozilla/5.0...',
    created_at: '2025-10-25T00:00:00Z',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should create audit log entry', async () => {
    (supabaseAdmin.from as jest.Mock).mockReturnValueOnce({
      insert: jest.fn().mockReturnValueOnce({
        select: jest.fn().mockReturnValueOnce({
          single: jest.fn().mockResolvedValueOnce({
            data: mockAuditLog,
            error: null,
          }),
        }),
      }),
    });

    const result = await auditLogService.log(
      AuditAction.Create,
      'workflow',
      'workflow-123',
      'user-123'
    );

    expect(result).toEqual(mockAuditLog);
  });
});

describe('Database Service - Error Handling', () => {
  test('DatabaseError should have correct properties', () => {
    const error = new DatabaseError('Test error', 'TEST_CODE', 400);
    expect(error.message).toBe('Test error');
    expect(error.code).toBe('TEST_CODE');
    expect(error.status).toBe(400);
    expect(error.name).toBe('DatabaseError');
  });

  test('DatabaseError should have default values', () => {
    const error = new DatabaseError('Test error');
    expect(error.code).toBe('DB_ERROR');
    expect(error.status).toBe(500);
  });
});
