using System.Data;
using Dapper;
namespace API.Interfaces;

public interface IDataContext
{
    Task<IEnumerable<T>> LoadData<T>(string sql, DynamicParameters? parameters);
    Task<T?> QuerySingleOrDefaultAsync<T>(string sql, DynamicParameters? parameters);
    Task<int> ExecuteAsync(string sql, DynamicParameters? parameters);
    Task<T?> InsertAndReturn<T>(string sql, DynamicParameters? parameters);
    IDbConnection CreateConnection();
}