/**
 * TableSlideForm 컴포넌트
 * 표 슬라이드 편집 폼
 */

'use client';

import { Lightbulb, BarChart3 } from 'lucide-react';
import type { TableSlide } from '@/types/slide';

interface TableSlideFormProps {
  slide: TableSlide;
  onChange: (updatedSlide: TableSlide) => void;
}

export default function TableSlideForm({ slide, onChange }: TableSlideFormProps) {
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({
      ...slide,
      props: {
        ...slide.props,
        title: e.target.value,
      },
    });
  };

  const handleHeaderChange = (index: number, value: string) => {
    const newHeaders = [...slide.props.headers];
    newHeaders[index] = value;
    onChange({
      ...slide,
      props: {
        ...slide.props,
        headers: newHeaders,
      },
    });
  };

  const handleCellChange = (rowIndex: number, colIndex: number, value: string) => {
    const newRows = slide.props.rows.map((row, rIdx) =>
      rIdx === rowIndex ? row.map((cell, cIdx) => (cIdx === colIndex ? value : cell)) : row
    );
    onChange({
      ...slide,
      props: {
        ...slide.props,
        rows: newRows,
      },
    });
  };

  const handleAddColumn = () => {
    const newHeaders = [...slide.props.headers, ''];
    const newRows = slide.props.rows.map((row) => [...row, '']);
    onChange({
      ...slide,
      props: {
        ...slide.props,
        headers: newHeaders,
        rows: newRows,
      },
    });
  };

  const handleRemoveColumn = (index: number) => {
    if (slide.props.headers.length <= 1) {
      alert('최소 1개의 열이 필요해요');
      return;
    }
    const newHeaders = slide.props.headers.filter((_, i) => i !== index);
    const newRows = slide.props.rows.map((row) => row.filter((_, i) => i !== index));
    onChange({
      ...slide,
      props: {
        ...slide.props,
        headers: newHeaders,
        rows: newRows,
      },
    });
  };

  const handleAddRow = () => {
    const newRow = Array(slide.props.headers.length).fill('');
    const newRows = [...slide.props.rows, newRow];
    onChange({
      ...slide,
      props: {
        ...slide.props,
        rows: newRows,
      },
    });
  };

  const handleRemoveRow = (index: number) => {
    if (slide.props.rows.length <= 1) {
      alert('최소 1개의 행이 필요해요');
      return;
    }
    const newRows = slide.props.rows.filter((_, i) => i !== index);
    onChange({
      ...slide,
      props: {
        ...slide.props,
        rows: newRows,
      },
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-4">표 슬라이드 편집</h3>
        <p className="text-sm text-gray-600 mb-6">
          데이터를 표로 정리하세요
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            제목 <span className="text-red-500">*</span>
          </label>
          <input
            id="title"
            type="text"
            value={slide.props.title}
            onChange={handleTitleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="슬라이드 제목을 입력하세요"
            required
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-medium text-gray-700">
              표 데이터 <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleAddColumn}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium px-2 py-1 border border-blue-300 rounded"
              >
                + 열 추가
              </button>
              <button
                type="button"
                onClick={handleAddRow}
                className="text-xs text-green-600 hover:text-green-700 font-medium px-2 py-1 border border-green-300 rounded"
              >
                + 행 추가
              </button>
            </div>
          </div>

          <div className="overflow-x-auto border border-gray-300 rounded-lg">
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th className="w-8 px-2 py-2 text-xs text-gray-500">#</th>
                  {slide.props.headers.map((header, colIndex) => (
                    <th key={colIndex} className="px-2 py-2">
                      <div className="flex items-center gap-1">
                        <input
                          type="text"
                          value={header}
                          onChange={(e) => handleHeaderChange(colIndex, e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-xs font-semibold text-center"
                          placeholder={`열 ${colIndex + 1}`}
                          required
                        />
                        {slide.props.headers.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveColumn(colIndex)}
                            className="text-red-500 hover:text-red-600 text-xs px-1"
                            aria-label="열 삭제"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {slide.props.rows.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    <td className="px-2 py-2 text-xs text-gray-500 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <span>{rowIndex + 1}</span>
                        {slide.props.rows.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveRow(rowIndex)}
                            className="text-red-500 hover:text-red-600 text-xs"
                            aria-label="행 삭제"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    </td>
                    {row.map((cell, colIndex) => (
                      <td key={colIndex} className="px-2 py-2">
                        <input
                          type="text"
                          value={cell}
                          onChange={(e) => handleCellChange(rowIndex, colIndex, e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                          placeholder="셀 내용"
                          required
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="flex items-center gap-1.5 text-xs text-gray-500 mt-2">
            <Lightbulb className="w-3.5 h-3.5 flex-shrink-0" />
            <span>표는 헤더(굵게)와 데이터 행으로 구성돼요</span>
          </p>
        </div>
      </div>

      <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-4">
        <p className="flex items-center gap-1.5 text-xs text-cyan-700">
          <BarChart3 className="w-3.5 h-3.5 flex-shrink-0" />
          <span>표 형식으로 데이터를 정리해 보여줘요</span>
        </p>
      </div>
    </div>
  );
}
