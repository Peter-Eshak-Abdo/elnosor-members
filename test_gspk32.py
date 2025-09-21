#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Скрипт тестирования приложения ГСПК 32
"""

import os
import sys
from database import DatabaseManager
from search import SearchModule


def test_database():
    """Тестирование базы данных"""
    print("🗄️ Тестирование базы данных...")

    try:
        db = DatabaseManager()

        # Тест добавления документа
        doc_id = db.add_document(
            title="Тестовый документ",
            content="Это тестовый документ для проверки функциональности базы данных ГСПК 32",
            doc_type="TEST",
            source="test"
        )

        if doc_id > 0:
            print("✅ Документ успешно добавлен")

            # Тест получения документа
            doc = db.get_document(doc_id)
            if doc and doc['title'] == "Тестовый документ":
                print("✅ Документ успешно получен")
            else:
                print("❌ Ошибка получения документа")

            # Тест поиска
            results = db.search_documents("тестовый")
            if results:
                print(f"✅ Поиск работает, найдено результатов: {len(results)}")
            else:
                print("❌ Поиск не работает")

            # Тест обновления
            if db.update_document(doc_id, title="Обновленный тестовый документ"):
                print("✅ Документ успешно обновлен")
            else:
                print("❌ Ошибка обновления документа")

            # Тест статистики
            stats = db.get_database_stats()
            if stats:
                print(f"✅ Статистика получена: {stats}")
            else:
                print("❌ Ошибка получения статистики")

        else:
            print("❌ Ошибка добавления документа")

    except Exception as e:
        print(f"❌ Ошибка тестирования базы данных: {e}")


def test_search():
    """Тестирование поиска"""
    print("\n🔍 Тестирование поиска...")

    try:
        search = SearchModule()

        # Тест поиска
        results = search.search("документ")
        print(f"✅ Поиск выполнен, найдено результатов: {len(results)}")

        if results:
            print("Первые результаты:")
            for i, result in enumerate(results[:3], 1):
                print(f"  {i}. {result.get('title', 'Без названия')}")

        # Тест статистики поиска
        stats = search.get_statistics()
        if stats:
            print(f"✅ Статистика поиска получена: {stats}")

    except Exception as e:
        print(f"❌ Ошибка тестирования поиска: {e}")


def test_import():
    """Тестирование импорта"""
    print("\n📥 Тестирование импорта...")

    try:
        # Запуск скрипта импорта
        os.system("python import_participants_fixed.py")

        # Проверка результатов импорта
        db = DatabaseManager()
        stats = db.get_database_stats()

        if stats.get('total_documents', 0) > 0:
            print(f"✅ Импорт выполнен успешно, документов в БД: {stats['total_documents']}")
        else:
            print("❌ Импорт не выполнен или не найдены документы")

    except Exception as e:
        print(f"❌ Ошибка тестирования импорта: {e}")


def test_kivy_app():
    """Тестирование Kivy приложения"""
    print("\n📱 Тестирование Kivy приложения...")

    try:
        # Импорт Kivy компонентов
        from kivy.app import App
        from kivy.uix.button import Button
        from kivy.uix.boxlayout import BoxLayout

        print("✅ Kivy успешно импортирован")

        # Тест создания простого интерфейса
        layout = BoxLayout(orientation='vertical')
        button = Button(text='Тестовая кнопка', size_hint=(1, 0.5))

        print("✅ Kivy компоненты созданы успешно")

    except ImportError as e:
        print(f"❌ Ошибка импорта Kivy: {e}")
        print("💡 Установите Kivy: pip install kivy")
    except Exception as e:
        print(f"❌ Ошибка тестирования Kivy: {e}")


def main():
    """Главная функция тестирования"""
    print("🧪 Запуск тестирования ГСПК 32")
    print("=" * 50)

    # Проверка Python версии
    print(f"Python версия: {sys.version}")

    # Запуск тестов
    test_database()
    test_search()
    test_import()
    test_kivy_app()

    print("\n" + "=" * 50)
    print("✅ Тестирование завершено!")


if __name__ == '__main__':
    main()
