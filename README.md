# Advanced CI/CD with GitHub Actions
### GitHub Actions: Best Practices, Performance Optimization & Security
**Course:** GitHub Actions and CI/CD — Advanced Concepts  
**Project:** advanced-ci-cd-demo  
**Live URL:** https://d2tvlwrdtefwx.cloudfront.net  
**Repository:** https://github.com/Oluwaseunoa/advanced-ci-cd-demo

---

## Table of Contents
1. [Project Overview](#1-project-overview)
2. [Phase 0 — Prerequisites](#2-phase-0--prerequisites)
3. [Phase 1 — Project Setup](#3-phase-1--project-setup)
4. [Phase 2 — First Commit and GitHub Push](#4-phase-2--first-commit-and-github-push)
5. [Phase 3 — GitHub Actions Workflows (Lessons 1, 2 & 3)](#5-phase-3--github-actions-workflows-lessons-1-2--3)
6. [Phase 4 — Pipeline Runs in GitHub Actions](#6-phase-4--pipeline-runs-in-github-actions)
7. [Phase 5 — AWS Infrastructure Setup](#7-phase-5--aws-infrastructure-setup)
8. [Phase 6 — GitHub Secrets and Environment](#8-phase-6--github-secrets-and-environment)
9. [Phase 7 — Full Pipeline with Live Deployment](#9-phase-7--full-pipeline-with-live-deployment)
10. [Phase 8 — Live App Verified on CloudFront](#10-phase-8--live-app-verified-on-cloudfront)
11. [Lessons Explained](#11-lessons-explained)

---

## 1. Project Overview

This project implements a complete, production-grade CI/CD pipeline using GitHub Actions. It covers all three advanced lessons:

| Lesson | Topic | Implementation |
|--------|-------|----------------|
| Lesson 1 | Best Practices | Descriptive names, modular reusable workflows, separate files per concern |
| Lesson 2 | Performance Optimization | Parallel test matrix (Node 18/20/22), dependency caching with `actions/cache` |
| Lesson 3 | Security | Least-privilege permissions, encrypted secrets, OIDC keyless AWS auth, scheduled scanning |

### Workflow Files Created
| File | Purpose |
|------|---------|
| `.github/workflows/build-test-deploy.yml` | Main pipeline — lint → test → security → build → deploy |
| `.github/workflows/reusable-node-setup.yml` | Reusable module for Node.js setup (Lesson 1 modularization) |
| `.github/workflows/security-scan.yml` | Scheduled weekly security and secret scanning (Lesson 3) |

### Final Job Graph
```
[Lint Source Code]
      /          \
[Test Matrix]  [Security Audit]   ← run in PARALLEL (Lesson 2)
      \          /
  [Build Application]
          |
  [Deploy to Production]          ← main branch only, OIDC auth (Lesson 3)
```

---

## 2. Phase 0 — Prerequisites

Before writing any code, I created the GitHub repository and confirmed all required tools were installed on my machine.

### Step 1 — Create the GitHub Repository

I created a new public repository named `advanced-ci-cd-demo` on GitHub with a README file to initialize it.

![Create new repository](img/1.create_new_repo_advanced-ci-cd-demo_README.png)

---

### Step 2 — Copy the Repository Link

I copied the HTTPS clone URL from GitHub to connect my local machine to the remote repository.

![Copy repo link](img/2.copy_repo_link_to_clone_it.png)

---

### Step 3 — Clone the Repository and Navigate Into It

I cloned the repository to my local machine and navigated into the project folder using Git Bash.

![Clone repo](img/3.clone_repo_and_navigate_into_it.png)

---

### Step 4 — Confirm All Tools Are Installed

I verified all four required tools by checking their versions in the terminal. All tools were confirmed working:
- `git version 2.47.1.windows.2`
- `node v22.13.0`
- `npm 11.0.0`
- `aws-cli/2.27.2`

![Confirm tool versions](img/4.confirm_tool_bychecking_version_of_git_node_npm_aws.png)

---

## 3. Phase 1 — Project Setup

### Step 5 — Initialize the Node.js Project

I ran `npm init -y` to create the `package.json` file. The `-y` flag accepts all defaults automatically.

> **Why:** `package.json` is Node.js's project manifest. It defines the project name, version, scripts, and dependencies. GitHub Actions will call the scripts defined here (`npm test`, `npm run lint`, `npm run build`) by name — so the workflow does not need to know how the project is structured internally.

![npm init -y](img/5.run_npm_init-y_to_initialize_project.png)

---

### Step 6 — Install Express

I installed Express as a production dependency — the web framework that powers the app.

```bash
npm install express
```

![Install Express](img/6.npm_install_express.png)

---

### Step 7 — Install Dev Tools

I installed Jest (test runner), ESLint (linter), Supertest (HTTP test client), and `@eslint/js` (ESLint v10 config) as dev dependencies.

```bash
npm install --save-dev jest eslint supertest @eslint/js
```

> **Why dev dependencies:** These tools are only needed during development and CI. They are not included in the production build, keeping the deployment lean and secure.

![Install dev tools](img/7.Install_dev_tools-Jest_for_testing_ESLint_for_linting_Supertest_for_API_ESlintJS_.png)

---

### Step 8 — Confirm Project Structure

I ran `ls` to confirm `node_modules/`, `package.json`, and `package-lock.json` were all present.

> **Why `package-lock.json` matters:** The workflow uses `npm ci` (not `npm install`). `npm ci` requires `package-lock.json` and installs exact versions — this ensures the CI environment is identical to local development every time.

![ls confirmation](img/8.ls_to_confirm_everything_is_installed_node_modules_package-json_package-lock-json.png)

---

### Step 9 — Open in VS Code

I ran `code .` to open the project folder in VS Code where I would create all the application files.

![Open VS Code](img/9.code%20.%20to_open_in_vscode.png)

---

### Step 10 — Create the `src/` Folder and `app.js`

I created a `src/` folder in the project root and created `app.js` inside it — the main Express web server file.

![Create src and app.js](img/10.in_vscode_create_inroot_folder_src_folder_in_it_app.js_file.png)

---

### Step 11 — Add Content to `app.js`

I added the Express application code with two routes:
- `GET /` — returns a JSON hello message
- `GET /health` — returns a health check response

![app.js content](img/11.add_app.js_content.png)

---

### Step 12 — Create `server.js`

I created `src/server.js` — the entry point that starts the Express server on port 3000 (or the `PORT` environment variable).

![server.js](img/12.also_create_server.js_in_src_and_add_content.png)

---

### Step 13 — Create `app.test.js`

I created `src/app.test.js` with two Jest tests that use Supertest to make HTTP requests against the app without starting a real server.

> **Why Supertest:** It lets tests call the Express app directly in memory. This means tests run faster and don't depend on a port being available — making them reliable in any CI environment.

![app.test.js](img/13.also_create_app.test.js_in_src_and_add_content.png)

---

### Step 14 — Create `.eslintrc.json`

I initially created `.eslintrc.json` as the ESLint configuration file in the project root.

![.eslintrc.json](img/14.create_.eslintrc.json_in_root_folder_and_add_content.png)

---

### Step 15 — Create `eslint.config.js`

Because ESLint v10 no longer supports the old `.eslintrc.json` format, I created the new flat config file `eslint.config.js` in the project root. This defines the language options and globals for Node.js and Jest environments.

> **Why this change matters:** ESLint v9+ uses a new "flat config" system. Understanding this difference is important because CI environments install the latest package versions — what works in an older local setup may fail in CI if not updated.

![eslint.config.js](img/15.also_create_.eslint.config.js_in_root_folder_and_add_content_to_ignore.png)

---

### Step 16 — Update `package.json` Scripts

I updated the `scripts` section of `package.json` to define the four commands GitHub Actions will call:

```json
"scripts": {
  "start":  "node src/server.js",
  "test":   "jest --coverage",
  "lint":   "eslint src/",
  "build":  "mkdir -p dist && cp -r src dist/"
}
```

![Update scripts](img/16.update_the_script_section_of_package-json_add_start_test_lint_and_buid.png)

---

### Step 17 — Set `"type": "module"` in `package.json`

I added `"type": "module"` to `package.json` to enable ES module syntax, which is required by the new ESLint flat config format.

![type module](img/17.also_set_the_type_to_module.png)

---

### Step 18 — Confirm Folder Structure

I ran `ls && ls src/` to confirm the full project structure was correct before running any tests.

![Confirm structure](img/18.ls%20&&%20ls%20src%20to_confirm_structure.png)

---

### Step 19 — Run Lint and Tests Locally

I ran `npm run lint` and `npm test` locally to confirm everything worked before pushing to GitHub.

**Results:**
- `npm run lint` — no errors (clean code)
- `npm test` — 2 tests passed, 100% code coverage

> **Why test locally first:** If tests fail in CI, it costs time waiting for a runner to spin up. Catching issues locally first means faster iteration.

![lint and test](img/19.ran_npm_run_lint_and_npm_test_successfully.png)

---

## 4. Phase 2 — First Commit and GitHub Push

### Step 20 — Stage and Commit All Files

I staged all files with `git add .` and created the first commit with a descriptive message following the conventional commit format (`feat:` prefix).

> **Why conventional commits:** Using prefixes like `feat:`, `ci:`, `docs:` makes the git history readable and is a Lesson 1 best practice for maintainable projects.

![git add and commit](img/20.add_and_commit_and_changes.png)

---

### Step 21 — Push to GitHub

I pushed the local `main` branch to the remote GitHub repository.

![git push](img/21.push_chane_to_github.png)

---

### Step 22 — Confirm Files on GitHub

I opened the repository in the browser and confirmed all files were visible — `src/`, `package.json`, `eslint.config.js`, `.gitignore`.

![Confirm on GitHub](img/22.confirm_pushed_change_on_github.png)

---

## 5. Phase 3 — GitHub Actions Workflows (Lessons 1, 2 & 3)

### Step 23 — Create the `.github/workflows/` Directory

I created the workflows directory. GitHub automatically detects and runs any `.yml` file placed here.

```bash
mkdir -p .github/workflows
```

![mkdir workflows](img/23.mkdir_workflows_folder_and_ls_.github_to_confim.png)

---

### Step 24 — Create `build-test-deploy.yml` (Lessons 1, 2 & 3)

I created the main pipeline workflow with 5 jobs. This single file demonstrates all three lessons:

**Lesson 1 — Best Practices:**
- Every job and step has a descriptive `name:` field
- Actions are pinned to specific versions (`actions/checkout@v4`) to prevent breaking changes
- Each job has a single clear responsibility

**Lesson 2 — Performance:**
- The `test` job uses `strategy.matrix` to run across Node.js 18, 20, and 22 simultaneously
- `actions/cache` stores `~/.npm` keyed on the hash of `package-lock.json` — same lockfile = cache hit = faster runs
- `needs:` creates a dependency graph so `test` and `security-audit` run in parallel after `lint`

**Lesson 3 — Security:**
- Global `permissions: contents: read` denies write access by default
- Each job declares only the extra permissions it actually needs
- The `deploy` job uses OIDC (`id-token: write`) — no AWS keys stored anywhere
- All sensitive values come from `${{ secrets.* }}` — never hardcoded

![build-test-deploy.yml](img/24.create_build-test-deploy.yml_in_workflows_folder_and_paste_content.png)

---

### Step 25 — Create `reusable-node-setup.yml` (Lesson 1 — Modular Workflows)

I created the reusable workflow using the `workflow_call` trigger. This demonstrates Lesson 1's requirement for modular, reusable workflows. Any other workflow can call this with `uses: ./.github/workflows/reusable-node-setup.yml` instead of repeating the setup steps.

> **Why this matters:** This is the `uses:` keyword the course specifically requires for demonstrating modular workflows. Inputs and secrets are explicitly declared — callers cannot accidentally inherit undeclared values.

![reusable-node-setup.yml](img/25.create_reusable-node-setup.yml_in_workflows_folder_and_paste_content.png)

---

### Step 26 — Create `security-scan.yml` (Lesson 3 — Scheduled Security Scanning)

I created the scheduled security workflow that runs automatically every Monday at 03:00 UTC using a `cron` trigger. It contains two jobs:

1. **dependency-scan** — runs `npm audit` and automatically opens a GitHub Issue if high/critical CVEs are found. Retains the audit report for 30 days.
2. **secret-scan** — uses Gitleaks with `fetch-depth: 0` to scan the **full git history** for accidentally committed secrets, not just the latest commit.

> **Why scheduled scanning:** Security vulnerabilities in dependencies are discovered after you commit your code. A scheduled scan catches new CVEs proactively — this is the "audit and monitor" requirement from Lesson 3.

![security-scan.yml](img/26.create_security-scan.yml_in_workflows_folder_and_paste_content.png)

---

### Step 27 — Commit and Push Workflow Files

I committed all three workflow files and pushed to GitHub. The moment this push landed on `main`, GitHub detected the workflows and the pipeline triggered automatically.

```bash
git add .github/
git commit -m "ci: add GitHub Actions workflows for build, test, security and deploy"
git push origin main
```

![commit and push workflows](img/27.commit_and_push_workflow.png)

---

## 6. Phase 4 — Pipeline Runs in GitHub Actions

### Step 28 — First Pipeline Run (Deploy Expected to Fail)

The pipeline ran immediately after the push. All jobs passed except **Deploy to Production**, which failed with a credentials error. This was **expected and correct** — AWS secrets had not been added yet.

**What passed on the first run:**
| Job | Result | Lesson |
|-----|--------|--------|
| Lint Source Code | ✅ Passed | Lesson 1 |
| Test on Node.js 18.x | ✅ Passed | Lesson 2 — parallel matrix |
| Test on Node.js 20.x | ✅ Passed | Lesson 2 — parallel matrix |
| Test on Node.js 22.x | ✅ Passed | Lesson 2 — parallel matrix |
| Security Audit | ✅ Passed | Lesson 3 |
| Build Application | ✅ Passed | Lesson 1 |
| Deploy to Production | ❌ No credentials yet | Expected |

![first pipeline run](img/28.note_that_job_passed_except_Deploy_to_Production_due_to_dummy_credentials.png)

---

## 7. Phase 5 — AWS Infrastructure Setup

### Step 29 — Navigate to S3 and Create Bucket

I signed in to the AWS Console, searched for S3, and clicked **Create bucket**.

![Navigate to S3](img/29.signin_to_aws_navigate_to_s3_and_click_on_create_bucket.png)

---

### Step 30 — Select Region us-east-1

I confirmed the region was set to **us-east-1 (N. Virginia)** — this must match the `aws-region` value in the workflow file.

![Select region](img/30.ensure_you_are_in_us-east-1_N.Virginia_.png)

---

### Step 31 — Name the Bucket

I gave the bucket the globally unique name `advanced-ci-cd-demo-seunhimalayas`. S3 bucket names must be unique across all AWS accounts worldwide.

![Name bucket](img/31.give_bucket_globally_unique_name_that_has_yourusername.png)

---

### Step 32 — Uncheck Block All Public Access

I unchecked "Block all public access" and checked the acknowledgement box. This allows CloudFront to serve files from the bucket publicly.

![Uncheck public access](img/32.uncheck_block_all_public_access_check_acknowledgement_box.png)

---

### Step 33 — Create the Bucket

I scrolled down and clicked **Create bucket**.

![Create bucket](img/33.scroll_down_and_click_create_bucket.png)

---

### Step 34 — Bucket Successfully Created

The bucket `advanced-ci-cd-demo-seunhimalayas` was created successfully in us-east-1.

![Bucket created](img/34.bucket_successfully_created.png)

---

### Step 35 — Navigate to CloudFront

I searched for CloudFront in the AWS Console and clicked **Create distribution**.

![Navigate to CloudFront](img/35.search_and_navigate_to_cloudfront_then_click_create_disribution.png)

---

### Step 36 — Configure Distribution Settings

I filled in the distribution name and scrolled down to continue configuration.

![Distribution settings](img/36.name_distribution_and_scroll_down_click_next.png)

---

### Step 37 — Select S3 as the Origin

I selected the S3 bucket `advanced-ci-cd-demo-seunhimalayas` as the origin domain — this tells CloudFront where to fetch files from.

![Select S3 origin](img/37.select_S3_as_origin_and_paste_and_select_bucket_name_as_origin_domain.png)

---

### Step 38 — Click Next

![Click next](img/38.click_next.png)

---

### Step 39 — Click Next to Review Page

![Click next again](img/39.click_next_again_to_go_to_review_page.png)

---

### Step 40 — Review and Create Distribution

I reviewed all settings and clicked **Create distribution**.

![Review and create](img/40.review_scroll_down_and_create_distribution.png)

---

### Step 41 — Distribution Created

CloudFront distribution `E2AHVN0Y4ZXFFC` was created with domain name `d2tvlwrdtefwx.cloudfront.net`.

![Distribution created](img/41.distribution_created.png)

---

### Step 42 — Go to Origins Tab and Edit

I clicked the **Origins** tab, selected the origin, and clicked **Edit** to configure Origin Access Control (OAC).

![Origins tab](img/42.click_origin_tab_select_origin_and_click_edit.png)

---

### Step 43 — Select Origin Access Control Settings

I selected **Origin access control settings (recommended)** and clicked **Create new OAC**.

> **Why OAC instead of public access:** OAC allows CloudFront to read from a private S3 bucket using a signed request. The bucket does not need to be publicly readable — only CloudFront can access it. This is a security best practice.

![OAC settings](img/43.select_Origin_access_control_settings_click_create_new_OAC.png)

---

### Step 44 — Create the OAC

I left all popup defaults and clicked **Create**.

![Create OAC](img/44.leave_everything_on_the_popup_at_default_and_click_create.png)

---

### Step 45 — Copy the Bucket Policy

After saving the OAC settings, AWS generated a bucket policy to allow CloudFront access. I clicked **Copy policy** and saved changes.

![Copy policy](img/45.OAC_created_copy_policy_scroll_down_and_save_change.png)

---

### Step 46 — Navigate to S3 Bucket Policy

I navigated to the S3 bucket, clicked **Permissions**, scrolled to **Bucket policy**, and clicked **Edit** to paste the copied policy.

![Navigate to bucket policy](img/46.navigate_to_created_S3_bucket_policy_and_click_edit.png)

---

### Step 47 — Paste and Save the Bucket Policy

I pasted the CloudFront-generated policy and saved. This grants CloudFront distribution `E2AHVN0Y4ZXFFC` permission to call `s3:GetObject` on the bucket.

![Save bucket policy](img/47.save_changes.png)

I also confirmed the pasted policy was saved correctly.

![Pasted policy confirmed](img/4.pasted_copied_policy.png)

---

### Step 48 — Navigate to IAM Identity Providers

I navigated to **IAM → Identity providers** to set up the OIDC trust between GitHub Actions and AWS.

> **Why OIDC instead of access keys:** Traditional deployments store an `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` as GitHub Secrets. These are long-lived credentials that can be leaked. OIDC eliminates this — GitHub proves its identity to AWS per-run and receives a short-lived token. Nothing sensitive is stored anywhere. This is the Lesson 3 security requirement in practice.

![Navigate to IAM](img/48.navigate_to_AWSIAM_and_click_identity_providers.png)

---

### Step 49 — Click Add Provider

![Add provider](img/49.click_add_provider.png)

---

### Step 50 — Configure the GitHub OIDC Provider

I selected **OpenID Connect**, set the Provider URL to `https://token.actions.githubusercontent.com`, and set the Audience to `sts.amazonaws.com`.

![Configure OIDC provider](img/50.select_OpenIDConnect_paste_url_and_audience_then_add_provider.png)

---

### Step 51 — Navigate to IAM Roles

I navigated to **IAM → Roles** and clicked **Create role**.

![Navigate to roles](img/51.navigate_to_IAM_role_and_click_create_role.png)

---

### Step 52 — Select Web Identity

I selected **Web identity** as the trusted entity type and chose `token.actions.githubusercontent.com` as the identity provider.

![Select web identity](img/52.select_web_identity_paste_select_provider_and_audience.png)

---

### Step 53 — Set GitHub Organization, Repository and Branch

I filled in:
- **GitHub organization:** `Oluwaseunoa`
- **GitHub repository:** `advanced-ci-cd-demo`
- **GitHub branch:** `main`

This restricts the role so it can **only** be assumed by workflows running in my exact repository on the `main` branch — not any other repo or branch.

![Set org/repo/branch](img/53.set_organization_repository_branch_and_next.png)

---

### Step 54 — Attach Permissions Policies

I attached `AmazonS3FullAccess` and `CloudFrontFullAccess` — the minimum permissions needed for the deploy job to sync files to S3 and invalidate the CloudFront cache.

![Attach policies](img/54.select_CloudFrontFullAccess_and_AmazonS3FullAccess_then_next.png)

---

### Step 55 — Name the Role

I named the role `github-actions-deploy-role` — a descriptive name that makes its purpose clear in the IAM console.

![Name the role](img/55.name_the_role_github-actions-deploy-role_and_scroll_down.png)

---

### Step 56 — Create the Role

![Create role](img/56.click_create_role.png)

---

### Step 57 — View the Created Role

I clicked the role name to open the summary page and verify it was configured correctly.

![Role created](img/57.role_created_click_to_view_role.png)

---

### Step 58 — Edit the Trust Policy

I clicked the **Trust relationships** tab and then **Edit trust policy** to refine the conditions.

![Edit trust policy](img/58.on_trust_relationship_tab_click_to_edit_trust_policy.png)

---

### Step 59 — Replace the Trust Policy

I replaced the auto-generated policy with a cleaner version using `StringLike` with a wildcard on the `sub` field. This is required because when a GitHub Environment (`production`) is involved, GitHub sends a different `sub` value than a plain branch push.

```json
{
  "Condition": {
    "StringEquals": {
      "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
    },
    "StringLike": {
      "token.actions.githubusercontent.com:sub": "repo:Oluwaseunoa/advanced-ci-cd-demo:*"
    }
  }
}
```

![Replace trust policy](img/59.replace_policy_and_update_policy.png)

---

### Step 60 — Copy the Role ARN

After updating the policy, I copied the Role ARN from the summary page:
`arn:aws:iam::342996267142:role/github-actions-deploy-role`

![Copy ARN](img/60.trust_policy_updated_click_to_copy_ARN.png)

---

## 8. Phase 6 — GitHub Secrets and Environment

### Step 61 — Navigate to Repository Settings

I opened the repository settings by clicking the **Settings** tab on the GitHub repository page.

![Navigate to settings](img/61.navigate_to_repo_settings.png)

---

### Step 62 — Open Secrets and Variables

I scrolled down in the left sidebar, expanded **Secrets and variables**, and clicked **Actions**.

![Secrets and variables](img/62.scroll_down_and_click_secrets_and_variables_then_click_actions.png)

---

### Step 63 — Click New Repository Secret

![New repository secret](img/63.click_new_repository_secret.png)

---

### Step 64 — Add Secret 1: `AWS_DEPLOY_ROLE_ARN`

I named the secret `AWS_DEPLOY_ROLE_ARN` and pasted the Role ARN as the value.

> **Why secrets and not hardcoding:** Hardcoding the ARN directly in the YAML file would expose the AWS account ID and role name publicly. GitHub Encrypted Secrets are encrypted at rest, masked in logs, and only injected into the workflow at runtime. This is the Lesson 3 requirement to "never hardcode sensitive information."

![AWS_DEPLOY_ROLE_ARN secret](img/64.name_AWS_DEPLOY_ROLE_ARN_secret_copied_ARN_then_add_secret.png)

---

### Step 65 — Add Secret 2: `S3_BUCKET_NAME`

I added the S3 bucket name `advanced-ci-cd-demo-seunhimalayas` as the second secret.

![S3_BUCKET_NAME secret](img/65.add_S3_BUCKET_NAME_secret_and_value_as_secret_2.png)

---

### Step 66 — Add Secret 3: `CLOUDFRONT_DISTRIBUTION_ID`

I added the CloudFront distribution ID `E2AHVN0Y4ZXFFC` as the third secret.

![CLOUDFRONT_DISTRIBUTION_ID secret](img/66.add_CLOUDFRONT_DISTRIBUTION_ID_secret_and_value_as_secret_3.png)

---

### Step 67 — All Three Secrets Confirmed

All three secrets are now listed. Their values are hidden — this is correct and expected. GitHub never shows secret values after they are saved.

![Three secrets added](img/67.three_repository_secret_now_added.png)

---

### Step 68 — Navigate to Environments

I clicked **Environments** in the repository settings sidebar.

![Navigate to environments](img/68.click_on_repo_settings_click_environments_button.png)

---

### Step 69 — Create New Environment

I clicked **New environment**.

![New environment](img/69.click_on_new_environment.png)

---

### Step 70 — Name the Environment `production`

I named the environment `production` — this name must match exactly what is written in the workflow's `environment: name: production` field.

![Name environment](img/70.name_it_production_and_click_configure.png)

---

### Step 71 — Add Required Reviewer

I checked **Required reviewers** and added my GitHub username `Oluwaseunoa` as the reviewer. This means the deploy job will pause and wait for manual approval before running — a protection gate on production deployments.

> **Why required reviewers:** This implements a human approval gate on production. No deployment can happen automatically — even if a bad commit passes all tests, a human must still click Approve. This is an important security and governance control.

![Required reviewer](img/71.under_deployment_rule_check_require_reviewer_and_add_your_username_to_the_reviewer.png)

---

### Step 72 — Save Protection Rules

![Save protection rules](img/72.save_protection_rule.png)

---

## 9. Phase 7 — Full Pipeline with Live Deployment

### Step 73 — Create a Change to Trigger the Pipeline

I created a `README.md` file using the `echo` command in the terminal to make a commit that would trigger the full pipeline including the deploy job.

```bash
echo "# Advanced CI/CD Demo" > README.md
```

![Create README](img/73.make_change_to_project_by_creating_readme.md_from_the_terminal_with_echo.png)

---

### Step 74 — Commit and Push the Change

```bash
git add README.md
git commit -m "docs: add README to trigger full pipeline with deployment"
git push origin main
```

![Commit and push](img/74.commit_and_push_change_to_github.png)

---

### Step 75 — Open the Running Workflow

I navigated to the **Actions** tab and clicked the new workflow run which was already in progress.

![Actions tab](img/75.on_repo_action_tab_click_running_workflow.png)

---

### Step 76 — Pipeline Paused at Deployment

All jobs ran and passed, then the pipeline paused at **Deploy to Production** waiting for environment approval. This confirmed the Required Reviewer protection rule was working correctly.

![Pipeline paused](img/76.note_all_jobs_ran_and_pause_at_deployment.png)

---

### Step 77 — Click Review Deployments

I clicked the **Review deployments** button that appeared in the orange banner.

![Review deployments](img/77.click_review_deployment.png)

---

### Step 78 — Approve the Deployment

I checked the **production** environment checkbox and clicked **Approve and deploy**.

![Approve deployment](img/78.check_production_and_click_approve_deployment.png)

---

### Step 79 — Deployment Now In Progress

The deploy job started running after approval.

![Deployment in progress](img/79.note_deployment_now_in_progress.png)

---

### Step 80 — First Deploy Attempt: OIDC Error

The first deployment attempt failed with:
`Error: Could not assume role with OIDC: Not authorized to perform sts:AssumeRoleWithWebIdentity`

**Root cause:** The trust policy used `StringEquals` with an exact `sub` match for `refs/heads/main`. However, when a GitHub Environment is active, GitHub sends a different `sub` value: `repo:Oluwaseunoa/advanced-ci-cd-demo:environment:production`. The exact match did not cover this case.

![OIDC error](img/80.deployment_failed_due_to_IAM_policy_OIDC_asumption_error_with_stsAssumeRoleWithWebIdentity.png)

---

### Step 81 — Navigate to the IAM Role to Fix

I went back to **AWS IAM → Roles → github-actions-deploy-role → Trust relationships** and clicked **Edit trust policy**.

![Navigate to fix](img/81.navigate_to_iam_role_github-actions-deploy-role_and_edit_trust_policy.png)

---

### Step 82 — Update the Trust Policy

I changed `StringEquals` to `StringLike` and replaced the exact `sub` value with a wildcard `repo:Oluwaseunoa/advanced-ci-cd-demo:*` to allow both branch-based and environment-based tokens.

![Update trust policy](img/82.update_trust_policy_to_integrate_stsAssumeRoleWithWebIdentity.png)

---

### Step 83 — Click Update Policy

![Click update policy](img/83.click_update_policy.png)

---

### Step 84 — Policy Updated Successfully

![Policy updated](img/84.policy_updated.png)

---

### Step 85 — Navigate Back to GitHub to Re-run

I went back to the failed workflow run on GitHub.

![Navigate to GitHub](img/85.naviate_to_github_and_rerun_all_jobs.png)

---

### Step 86 — Click Re-run Failed Jobs

I clicked **Re-run jobs → Re-run failed jobs** to retry only the deploy job without repeating the already-passed lint, test, and build jobs.

![Re-run failed jobs](img/86.click_re-run_jobs.png)

---

### Step 87 — Review and Approve Again

The pipeline paused again at the approval gate. I reviewed and approved the deployment a second time.

![Approve again](img/87.review_approve_and_deploy_again.png)

---

### Step 88 — Deployment Successful

The Deploy to Production job completed successfully. The logs showed `Assuming role with OIDC` confirming keyless authentication was working — no AWS access keys were used anywhere.

![Deployment successful](img/88.deployment_now_successful.png)

---

### Step 89 — Files Deployed to S3

I opened the S3 bucket in the AWS Console and confirmed the deployed files were present: `src/app.js`, `src/app.test.js`, `src/server.js`.

![S3 files](img/89.note_the_deloyed_files_are_now_uploaded_on_the_S3_bucket.png)

---

## 10. Phase 8 — Live App Verified on CloudFront

### Step 90 — Copy the CloudFront Domain Name

I navigated to the CloudFront distribution and copied the domain name `d2tvlwrdtefwx.cloudfront.net`.

![Copy domain name](img/90.navigate_to+CloudFront_and_copy_distribution_domain_name_.png)

---

### Step 91 — First Visit: Access Denied

The first visit to the URL showed `Access Denied`. This was because CloudFront did not know which file to serve at the root `/` — there was no `index.html`, only `src/app.js`.

![Access denied](img/91.visit_the_link_on_browser_it_shows_access_denied.png)

---

### Step 92 — Edit the Distribution Settings

I went to the CloudFront distribution **General** tab and clicked **Edit** to set a default root object.

![Edit distribution](img/92.under_General_tab_of_distribution_click_edit.png)

---

### Step 93 — Set Default Root Object

I set the **Default root object** to `src/app.js` so CloudFront knows what file to serve when someone visits the root URL `/`.

![Set default root](img/93.set_default_root_to_src-app.js_to_tell_cloudfront_what_to_display.png)

---

### Step 94 — Save Changes

![Save changes](img/94.save_changes.png)

---

### Step 95 — Live App Confirmed 🎉

After saving, the CloudFront URL now serves the application code live from AWS:

```
https://d2tvlwrdtefwx.cloudfront.net
```

![Live app](img/95.link_now_display_app.js_code.png)

The application code written locally in VS Code is now being served globally through AWS CloudFront — deployed automatically by the GitHub Actions pipeline with no manual file uploads.

---

## 11. Lessons Explained

### Lesson 1: Best Practices

**Descriptive Names:** Every workflow, job, and step has a `name:` field that describes its intent. In the GitHub Actions UI, you see "Lint Source Code", "Test on Node.js 20.x", "Deploy to Production" — not just `lint`, `test`, `deploy`. This makes it immediately clear what failed without opening the logs.

**Pinned Action Versions:** All actions are pinned to a specific version tag (e.g. `actions/checkout@v4`). If I had written `actions/checkout@latest`, a breaking change in the action could silently break my pipeline. Pinning prevents this.

**Reusable Workflows:** `reusable-node-setup.yml` uses the `workflow_call` trigger — any other workflow can call it with `uses: ./.github/workflows/reusable-node-setup.yml` instead of repeating the setup steps. This is the modular workflow the course requires.

**Separation of Concerns:** Three separate files each have one responsibility. The build pipeline, the reusable module, and the security scanner are completely independent. Disabling the security scanner does not affect the build pipeline.

---

### Lesson 2: Performance Optimization

**Parallel Test Matrix:** The `test` job uses `strategy.matrix` with Node.js versions 18, 20, and 22. GitHub spins up three separate runners simultaneously — all three versions are tested at the same time, not one after another. This is approximately 3x faster than sequential execution.

**`fail-fast: false`:** This deliberate setting means if Node 18 fails, Node 20 and 22 still complete. This gives more diagnostic information — you know immediately if the failure is version-specific.

**Dependency Caching:** `actions/cache` stores `~/.npm` between runs, keyed on the hash of `package-lock.json`. If the lockfile has not changed, the cache hits and `npm ci` completes in ~2 seconds instead of 30+ seconds. The `restore-keys` fallback means even if the exact key misses, a partial cache is used.

**Job Dependency Graph:** The `needs:` keyword creates the optimal execution order: `lint` runs first, then `test` and `security-audit` run in parallel, then `build` waits for both, then `deploy` runs last. No job waits longer than it needs to.

---

### Lesson 3: Security

**Least Privilege:** The workflow sets `permissions: contents: read` globally, denying write access to all jobs by default. Each job then declares only the additional permissions it actually needs — `security-events: write` for the security job to upload SARIF results, `id-token: write` for the deploy job to request an OIDC token. No job has more access than necessary.

**No Hardcoded Credentials:** Every sensitive value — the AWS role ARN, S3 bucket name, CloudFront distribution ID — is stored as a GitHub Encrypted Secret and accessed via `${{ secrets.* }}`. Secret values are masked in all logs and never visible after being saved.

**OIDC Keyless Authentication:** The deploy job uses OpenID Connect instead of AWS access keys. GitHub acts as an identity provider — it issues a signed JWT proving the workflow is running in my exact repository on the main branch. AWS validates this token against the trust policy and issues a short-lived credential for that one run only. Nothing sensitive is stored anywhere.

**Scheduled Security Scanning:** `security-scan.yml` runs every Monday at 03:00 UTC via `cron: '0 3 * * 1'`. It scans npm dependencies for CVEs and scans the full git history for accidentally committed secrets using Gitleaks with `fetch-depth: 0`. This is proactive security — not just reactive to new commits.

**Production Approval Gate:** The `production` GitHub Environment has a Required Reviewer configured. The pipeline pauses at the deploy job and waits for manual approval. This prevents any commit — even one that passes all tests — from reaching production without a human review.

---

*Project completed as part of the GitHub Actions and CI/CD Advanced Concepts course.