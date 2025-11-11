# Using Vite and Deploying to GitHub Pages

## Configuration File

There is already a configuration file in the project, which uses the YAML format. Here is the content of this file:

```
name: Build and deploy to GitHub Pages

on:
  push:
    branches: [main] # Specify the branch from which the program should be displayed

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout 
        uses: actions/checkout@v2.3.1
      - name: Install and build 
        run: |
          npm install
          npm run build
      - name: Deploy 
        uses: JamesIves/github-pages-deploy-action@4.1.0
        with:
          branch: gh-pages
          folder: dist

```

This file configures GitHub Actions to automatically build and deploy your application to GitHub Pages after each commit to the specified branch.

## Overview

This project aims to provide a template for creating and deploying web applications using Vite and GitHub Pages.

## Running Instructions

1. Clone the repository: git clone <URL of the repository>
2. Install dependencies: npm install
3. Run a local development server: npm run dev
4. Build for production: npm run build

## Configuring GitHub Actions Permissions

1. Sign in to your repository on GitHub.
2. Click on the "Settings" tab at the top of the page.
3. Scroll down to the "Actions" section in the side menu.
4. Select "General".
5. In the "Workflow permissions" section, find the "Read and write permissions" option and make sure it is checked.
6. Under the "Allow GitHub Actions to create and approve pull requests" option, check the box.
7. Click the "Save" button to save the changes.

After completing these steps, GitHub Actions will have the necessary permissions to create and approve pull requests in your repository.

## Vite Configuration

Vite configuration is usually found in the vite.config.js file. However, for basic usage, you can use the following template:

```
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  plugins: [react()],
})

```

## Additional Information
For more information and to expand capabilities, please refer to the documentation for Vite and GitHub Pages.


# Використання Vite та деплой на GitHub Pages

## Файл конфігурації

У проекті вже є файл конфігурації, який використовує формат YAML. Ось вміст цього файлу:

```yaml
name: Build and deploy to GitHub Pages

on:
  push:
    branches: [main] # Вкажіть назву гілки, з якої потрібно відображати програму

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout 
        uses: actions/checkout@v2.3.1
      - name: Install and build 
        run: |
          npm install
          npm run build
      - name: Deploy 
        uses: JamesIves/github-pages-deploy-action@4.1.0
        with:
          branch: gh-pages
          folder: dist

```

Цей файл налаштовує GitHub Actions на автоматичну збірку та деплой вашого додатку 
на GitHub Pages після кожного коміту у вказану гілку.

## Огляд

Цей проект має за мету надати шаблон для створення та розгортання веб-додатків з 
використанням Vite та деплою на GitHub Pages.

## Інструкція з запуску
1. Клонування репозиторію: git clone <URL репозиторію>
2. Встановлення залежностей: npm install
3. Запуск локального сервера для розробки: npm run dev
4. Збірка для продакшн: npm run build

## Налаштування дозволів GitHub Actions

1. Увійдіть у ваш репозиторій на GitHub.
2. Клацніть на вкладку "Settings" (Налаштування) у верхній частині сторінки.
3. Прокрутіть вниз до розділу "Actions" (Дії) у бічному меню.
4. Оберіть "General" (Загальне).
5. У розділі "Workflow permissions" (Дозволи на робочі процеси), знайдіть опцію 
"Read and write permissions" (Дозволи на читання та запис) і переконайтеся, 
що біля неї встановлена галочка.
6. Під опцією "Allow GitHub Actions to create and approve pull requests" 
(Дозволити GitHub Actions створювати та затверджувати запити на витягування), 
встановіть галочку.
7. Натисніть на кнопку "Save" (Зберегти), щоб зберегти зміни.

Після виконання цих кроків GitHub Actions матиме необхідні дозволи для створення 
та затвердження запитів на витягування у вашому репозиторії.

## Конфігурація Vite
Конфігурація Vite зазвичай знаходиться у файлі vite.config.js. Однак, для базового 
використання можна використовувати наступний шаблон:

```
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  plugins: [react()],
})
```

## Додаткова інформація
Для отримання додаткової інформації та розширення можливостей, будь ласка, 
перегляньте документацію Vite та GitHub Pages.